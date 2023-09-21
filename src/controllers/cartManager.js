import {
    serviceAddCart,
    serviceAddProductToCart,
    serviceDeleteAllProductsInCart,
    serviceDeleteProductInCart,
    serviceGetProductsInCart,
    serviceUpdateProductQty,
    serviceQtyInCart,
    servicePurchase
} from "../services/cart.js";

const isUserAdmin = (user) => {
    return user && user.role === 'admin';
};

const isUserPremium = (user) => {
    return user && user.role === "premium";
}

const getQtyInCart = async (req, res) => {
    try {
        const productsInCart = await serviceQtyInCart(req.params.cid);
        res.status(200).send(productsInCart);
    } catch (error) {
        res.status(500).send({ messaage: "Error trying to get quantity" });
    }
}

const addCart = async (req, res) => {
    try {
        const addedCart = await serviceAddCart();
        res.status(201).send(addedCart);
    } catch (error) {
        res.status(400).send({ message: "Error adding new Cart" });
    }

}

const getProductsInCart = async (req, res) => {
    let user = req.session.user;
    const { cid } = req.params;
    try {
        const productCreatedBy = await isUserProductInCart(user._id, cid);
        const productsInCart = await serviceGetProductsInCart(cid);
        let isAdmin = isUserAdmin(user);
        let isPremium = isUserPremium(user);
        res.status(200).render("cart", { productsInCart, productCreatedBy, user, isAdmin, isPremium, title: "Cart", style: "index.css" });
    } catch (error) {
        res.status(500).send({ message: "Error trying to get products in cart" });
    }
}

const isUserProductInCart = async (uid, cid) => {
    const productsInCart = await serviceGetProductsInCart(cid);

    for (const product of productsInCart) {
        if (!product.createdBy) {
            return false;
        } else if ((product.createdBy.toString() === uid.toString())) {
            return true;
        }
    }
    return false;
};

const deleteAllProductsInCart = async (req, res) => {
    try {
        const emptyCart = await serviceDeleteAllProductsInCart(req.params.cid);
        res.send(emptyCart);
    } catch (error) {
        res.status(500).send({ message: "Error trying to delete all products in Cart" });
    }
}

const addProductToCart = async (req, res) => {
    const pid = req.params.pid
    const cid = req.params.cid
    try {
        const addedProduct = await serviceAddProductToCart(cid, pid);
        res.send(addedProduct);
    } catch (error) {
        res.status(500).send({ message: "Error trying to add product to a cart" });
    }
}

const deleteProductInCart = async (req, res) => {
    const pid = req.params.pid;
    const cid = req.params.cid
    try {
        const deletedProduct = await serviceDeleteProductInCart(cid, pid);
        res.send(deletedProduct);
    } catch (error) {
        res.status(500).send({ message: "Error trying to delete a product from the cart" });
    }
}

const updateProductQty = async (req, res) => {
    try {
        const result = await serviceUpdateProductQty(req.params, req.body);
        res.send(result);
    } catch (error) {
        res.status(500).send({ messaage: "Error trying  to update the product quantity" });
    }
}

const purchase = async (req, res) => {
    try {
        const result = await servicePurchase(req.params.cid);
        res.json(result);
    } catch (error) {
        res.status(500).send({ message: "Error trying to purchase" })
    }
}

export { getProductsInCart, addCart, addProductToCart, deleteProductInCart, deleteAllProductsInCart, updateProductQty, getQtyInCart, purchase }
