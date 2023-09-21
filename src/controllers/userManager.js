import {
  serviceGetAllUsers,
  serviceSaveUser,
  serviceLoginUser,
  serviceDeleteAllUsers,
  serviceDeleteUserById,
  serviceUpdateUserRole,
  serviceRestorePassword,
  serviceGetUserByEmail,
} from "../services/auth.js";
import { serviceProductsFromDTO } from "../services/product.js";
import { isValidPassword } from "../utils/index.js";
import transporter from "../utils/mail.js";
import { userModel } from "../models/users.model.js";
import { GMAIL } from "../config/index.config.js";
import { v4 } from "uuid";
import {
  serviceCreateToken,
  serviceDeleteTokenById,
  serviceFindTokenByUserId,
} from "../services/token.js";

const loginForm = (req, res) => {
  res.render("login", { title: "Login", style: "index.css" });
};

const login = async (req, res) => {
  try {
    const user = await serviceLoginUser(req.body);
    const validPassword = isValidPassword(user, req.body.password);
    if (validPassword) {
      const userDate = await userModel.findOneAndUpdate(
        { email: user.email },
        { lastLoginDate: new Date() },
        { new: true }
      );
      req.session.user = user;
      const response = {
        status: "success",
        payload: {
          message: "Login Success",
          cartId: user.cartId,
          userDate: userDate,
        },
        redirectTo: "/api/products",
      };
      res.send(response);
    } else {
      res
        .status(404)
        .send({ status: "error", payload: "Incorrect Email/Password" });
    }
  } catch (error) {
    res.status(500).send({ status: "error", payload: "Error with the server" });
  }
};

const registerForm = async (req, res) => {
  res.render("register", { title: "Register", style: "index.css" });
};

const register = async (req, res) => {
  try {
    let user = await serviceLoginUser(req.body);
    if (!user.email) {
      await serviceSaveUser(req.body);
      res
        .status(201)
        .send({ status: "success", payload: "Registered Succesfully!", user });
    } else {
      res
        .status(403)
        .send({ status: "error", payload: "Email already in use" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ status: "error", payload: "Error creating an account" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await serviceGetAllUsers();
    res
      .status(200)
      .send({ status: "success", payload: "All users found", allUsers });
  } catch (error) {
    res
      .status(500)
      .send({ status: "error", payload: "Error finding all users" });
  }
};

const updateUserRole = async (req, res) => {
  const { uid, newRole } = req.body;
  try {
    const updatedUser = await serviceUpdateUserRole(uid, newRole);
    res
      .status(200)
      .send({
        status: "success",
        payload: "User role updated",
        user: updatedUser,
      });
  } catch (error) {
    res
      .status(500)
      .send({ status: "error", payload: "Error updating user role" });
  }
};

const renderRestorePassword = async (req, res) => {
  res.render("restore-password", { style: "index.css" });
};

const sendTokenToEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const token = v4();
    const expirationDate = new Date(Date.now() + 3600000); // Vence en 1 hora

    const newToken = await serviceCreateToken({
      token,
      user: email,
      expiresAt: expirationDate,
    });

    const mailOptions = {
      from: GMAIL,
      to: email,
      subject: "Restablecer contraseña",
      text: `Tu código de restablecimiento de contraseña es: ${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.send({ status: "Error sending email:", error });
      } else {
        res.send({ status: "Email sent:", info });
      }
    });
    res.json({
      message:
        "Se ha enviado un correo electrónico con el código de restablecimiento",
      payload: newToken,
    });
  } catch (error) {
    console.error("Error al enviar el token:", error);
    return res.status(500).json({ message: "Error al enviar el token" });
  }
};

const restorePassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const tokenReset = await serviceFindTokenByUserId(email);
    if (tokenReset.token !== code || tokenReset.expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "Código de restablecimiento inválido o vencido" });
    }

    const updatedUser = await serviceRestorePassword(email, newPassword);

    await serviceDeleteTokenById(tokenReset._id);
    res
      .status(200)
      .send({
        status: "success",
        payload: "User password updated",
        user: updatedUser,
      });
  } catch (error) {
    res
      .status(500)
      .send({ status: "error", payload: "Error updating user password" });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    await serviceDeleteAllUsers();
    res.status(200).send({ status: "success", payload: "All users deleted" });
  } catch (error) {
    res
      .status(500)
      .send({ status: "error", payload: "Error deleting all users" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    let uid = req.params.uid;
    if (!uid) {
      res.status(404).send({ status: "error", payload: "User not found" });
    } else {
      await serviceDeleteUserById(uid);
      res.status(200).send({ status: "success", payload: "User deleted" });
    }
  } catch (error) {
    res.status(500).send({ status: "error", payload: "Error deleting user" });
  }
};

const deleteInactiveUsers = async (req, res) => {
  try {
    // Obtén la fecha actual hace dos días
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Encuentra y elimina los usuarios inactivos
    const inactiveUsers = await userModel.deleteMany({
      lastLoginDate: { $lt: twoDaysAgo },
    });

    // Envía correos electrónicos a los usuarios eliminados
    inactiveUsers.forEach((user) => {
      const mailOptions = {
        from: GMAIL,
        to: user.email,
        subject: "Eliminación de cuenta por inactividad",
        text: "Tu cuenta ha sido eliminada debido a la inactividad durante dos días.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.send({ status: "Error sending email:", error });
        } else {
          res.send({ status: "Email sent:", info });
        }
      });
    });

    res.json({
      status: "success",
      payload: "Usuarios inactivos eliminados correctamente.",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        payload: "Error trying to delete inactive users.",
      });
  }
};

const isUserAdmin = (user) => {
  return user && user.role === "admin";
};

const adminView = async (req, res) => {
  const allUsers = await serviceGetAllUsers();
  const allProducts = await serviceProductsFromDTO();
  const user = req.session.user;
  const isAdmin = isUserAdmin(user);
  res.render("admin", {
    user,
    isAdmin,
    allUsers,
    allProducts,
    style: "index.css",
  });
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      res.redirect("/auth/login");
    } else res.send({ status: "error", payload: "Logout Error", body: err });
  });
};

export {
  register,
  login,
  logout,
  registerForm,
  loginForm,
  getAllUsers,
  deleteAllUsers,
  deleteUserById,
  deleteInactiveUsers,
  adminView,
  updateUserRole,
  restorePassword,
  renderRestorePassword,
  sendTokenToEmail,
};
