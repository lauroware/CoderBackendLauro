import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/index.config.js";
import { productModel } from "../models/products.model.js";
import { cartModel } from "../models/carts.model.js";

export default class PaymentService {
    constructor() {
        this.stripe = new Stripe(STRIPE_SECRET_KEY);
    }

    createPaymentIntent = async (data) => {
        const paymentIntent = await this.stripe.paymentIntents.create(data);
        return paymentIntent;
    }
}