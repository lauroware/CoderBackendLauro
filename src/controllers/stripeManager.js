import PaymentService from "../services/stripe.js";
const paymentService = new PaymentService();
import { serviceDeleteProductInCart, serviceGetProductsInCart } from "../services/cart.js";
import { serviceGetProductById, serviceUpdateProduct } from "../services/product.js";
import { serviceCreateTicket, serviceFindTicketByPurchaser } from "../services/ticket.js";
import { STRIPE_PUBLIC_KEY } from "../config/index.config.js";

const isUserAdmin = (user) => {
    return user && user.role === 'admin';
};

const isUserPremium = (user) => {
    return user && user.role === "premium";
}

const calculateCartTotalAndProducts = async (cid) => {
    const productsInCart = await serviceGetProductsInCart(cid);
    let amount = 0;
    let products = [];
    let outOfStockProducts = [];
    for (const productInCart of productsInCart) {
        const product = await serviceGetProductById(productInCart._id);
        if (productInCart.quantity <= product.stock) {
            amount += (product.price * productInCart.quantity);
            products.push({ product: product, quantity: productInCart.quantity });
        } else {
            outOfStockProducts.push({ product: product, quantity: productInCart.quantity });
        }
    }
    return { amount: amount, products: products, outOfStockProducts: outOfStockProducts };
};

export const renderCheckout = async (req, res, next) => {
    let user = req.session.user;
    const { cid } = req.params;
    try {
        const { amount, products, outOfStockProducts } = await calculateCartTotalAndProducts(cid);
        res.status(200).render("checkout", {
            user: req.session.user,
            style: "index.css",
            total: amount,
            products: products,
            outOfStockProducts: outOfStockProducts,
            purchaser: user
        });
    } catch (error) {
        res.status(500).send({ message: "Error trying to render the checkout" });
    }
}

export const processPayment = async (req, res) => {
    let user = req.session.user;
    const { cid } = req.params;
    try {
        const { amount } = await calculateCartTotalAndProducts(cid);
        if (amount <= 0) {
            return res.status(400).send({ status: "error", payload: "El total de compra no puede ser 0" });
        }
        const charge = {
            amount: Math.round(amount * 100),
            currency: 'usd',
        };

        const result = await paymentService.createPaymentIntent(charge);
        res.status(200).send({ status: "success", payload: { client_secret: result.client_secret, purchaser: user } });
    } catch (error) {
        res.status(500).send({ message: "Error trying to process the payment" });
    }
}

export const getPublicKey = async (req, res) => {
    const publicKey = STRIPE_PUBLIC_KEY;
    res.json({ publicKey });
}

export const confirmPurchase = async (req, res) => {
    const { cid } = req.params
    const user = req.session.user;
    try {
        const productsInCart = await serviceGetProductsInCart(cid);
        let amount = 0;
        const productsTicket = [];
        for (const productInCart of productsInCart) {
            const product = await serviceGetProductById(productInCart._id);
            if (productInCart.quantity <= product.stock) {
                amount += (product.price * productInCart.quantity);
                product.stock -= productInCart.quantity;
                await serviceUpdateProduct(product._id, product);
                productsTicket.push(product);
                await serviceDeleteProductInCart(cid, productInCart._id.toString());
            }
        }
        let ticket;
        if (productsTicket.length) {
            ticket = await serviceCreateTicket({
                purchase_datetime: new Date(),
                amount: amount,
                purchaser: user,
            });
        }
        res.status(201).send({ status: "success", payload: { ticket }, user });
    } catch (error) {
        res.status(500).send({ message: "Error trying to confirm the purchase" });
    }
}

export const renderTickets = async (req, res) => {
    let user = req.session.user;

    try {
        const getTickets = await serviceFindTicketByPurchaser(user._id);
        let isAdmin = isUserAdmin(user);
        let isPremium = isUserPremium(user);
        if (getTickets === null) {
            res.status(404).render("tickets", { style: 'index.css', user, isPremium, isAdmin, message: "Tickets not found on this user" });
        } else {
            res.status(200).render("tickets", { style: 'index.css', user, isPremium, isAdmin, getTickets })
        }
    } catch (error) {
        res.status(500).send({ message: "Error trying to render the tickets" });
    }
}