import {
  serviceAddProduct,
  serviceDeleteProductById,
  serviceDeleteAllProducts,
  serviceGetProductById,
  serviceGetProducts,
  serviceUpdateProduct,
  serviceProductsCreatedBy,
} from "../services/product.js";
import { serviceDeleteProductInCart } from "../services/cart.js";
import { userModel } from "../models/users.model.js";
import transporter from "../utils/mail.js";
import { GMAIL } from "../config/index.config.js";

const isUserAdmin = (user) => {
  return user && user.role === "admin";
};

const isUserPremium = (user) => {
  return user && user.role === "premium";
};

const getProducts = async (req, res) => {
  let user = req.session.user;
  try {
    const products = await serviceGetProducts(req.query);
    let isAdmin = isUserAdmin(user);
    let isPremium = isUserPremium(user);
    const hasNextPage = products.hasNextPage;
    const hasPrevPage = products.hasPrevPage;
    const sort = products.sort;
    const page = products.page;
    const query = products.query;
    const allCategories = products.docs.map((element) => element.category);
    const categories = allCategories.filter(
      (element, index, self) => self.indexOf(element) === index
    );
    res.status(200).render("home", {
      title: "Products",
      style: "index.css",
      products,
      hasNextPage,
      hasPrevPage,
      sort,
      page,
      query,
      categories,
      user,
      isPremium,
      isAdmin,
    });
  } catch (error) {
    res.status(500).send({ message: "Error trying to get all products" });
  }
};

const getProductById = async (req, res) => {
  const id = req.params.pid;
  let user = req.session.user;
  try {
    let product = await serviceGetProductById(id);
    let isAdmin = isUserAdmin(user);
    let isPremium = isUserPremium(user);
    res.render("details", {
      product,
      user,
      isAdmin,
      isPremium,
      title: "Products",
      style: "index.css",
    });
  } catch (error) {
    res.status(500).send({ message: "Error trying to get a product by id" });
  }
};

const getProductsFromPremiumUsers = async (req, res) => {
  let user = req.session.user;
  try {
    let allProducts = await serviceProductsCreatedBy(user._id);
    let isPremium = isUserPremium(user);
    res.render("premiumUser", {
      user,
      isPremium,
      allProducts,
      style: "index.css",
    });
  } catch (error) {
    res.status(500).send({ message: "Error trying to get a product by id" });
  }
};

const addProduct = async (req, res) => {
  let user = req.session.user;
  try {
    const newProduct = await serviceAddProduct(req.body, user._id);
    res.status(201).send({
      status: "success",
      message: "Registered succesfully!",
      payload: newProduct,
    });
  } catch (error) {
    res.status(500).send({ message: "Error adding new Product" });
  }
};

const updateProduct = async (req, res) => {
  const { pid, updates } = req.body;
  try {
    const result = await serviceUpdateProduct(pid, updates);
    if (result.status === "error") {
      res.status(404).send({ message: result.payload });
    } else {
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating the product" });
  }
};

const deleteAllProducts = async (req, res) => {
  try {
    const deleteAllProducts = await serviceDeleteAllProducts();
    res.status(200).send({ message: "Products deleted", deleteAllProducts });
  } catch (error) {
    res.status(500).send({ message: "Error trying to delete all products" });
  }
};

const deleteProductById = async (req, res) => {
  const id = req.params.pid;
  try {
    const deletedProduct = await serviceDeleteProductById(id);

    const premiumUsers = await userModel
      .find({ role: "premium" })
      .populate("cartId");

    for (const user of premiumUsers) {
      const cart = user.cartId;
      if (cart) {
        const productExists = cart.products.some(
          (product) => product.product.toString() === id
        );
        if (productExists) {
          const mailOptions = {
            from: GMAIL,
            to: user.email,
            subject: "Eliminación de producto en carrito",
            text: `Estimado ${user.first_name},\n\nEl producto en su carrito ha sido eliminado.`,
          };
          try {
            await transporter.sendMail(mailOptions);
          } catch (error) {
            res.status(500).send({ message: "Error enviando el correo" });
          }

          await serviceDeleteProductInCart(cart, id);
        }
      }
    }

    res.status(200).send({
      message: "Producto borrado exitosamente",
      payload: deletedProduct,
    });
  } catch (error) {
    res.status(500).send({ message: "Error borrandoe el producto", error });
  }
};

export {
  addProduct,
  getProducts,
  deleteAllProducts,
  deleteProductById,
  getProductById,
  updateProduct,
  getProductsFromPremiumUsers,
};
