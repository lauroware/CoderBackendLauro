import { Router } from "express";
const cartsRouter = Router();
import {
    getProductsInCart,
    addCart,
    addProductToCart,
    deleteProductInCart,
    deleteAllProductsInCart,
    updateProductQty,
    getQtyInCart,
} from "../controllers/cartManager.js";
import { authMiddleware } from "../middlewares/index.js";
import { processPayment, renderCheckout, confirmPurchase } from "../controllers/stripeManager.js";

cartsRouter.post("/", authMiddleware, addCart);
cartsRouter.get("/quantity/:cid", getQtyInCart);
cartsRouter.get("/:cid", getProductsInCart);
cartsRouter.delete("/:cid", deleteAllProductsInCart);
cartsRouter.post("/:cid/product/:pid", addProductToCart);
cartsRouter.delete("/:cid/product/:pid", deleteProductInCart);
cartsRouter.put("/:cid/product/:pid", updateProductQty)
cartsRouter.get("/:cid/checkout", authMiddleware, renderCheckout)
cartsRouter.post("/:cid/purchase", authMiddleware, processPayment);
cartsRouter.post("/:cid/confirmPurchase", confirmPurchase);

export default cartsRouter;