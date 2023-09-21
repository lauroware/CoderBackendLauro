// Importamos las dependencias necesarias
import passport from "passport";
import GitHubStrategy from "passport-github2";
import { userModel } from "../models/users.model.js";
import { serviceAddCart } from "../services/cart.js";
import { GITHUB_ID, GITHUB_SECRET } from "./index.config.js";

// Inicializamos Passport con la estrategia de autenticación de GitHub
const initializePassport = () => {
  // Configuración para serializar al usuario en una sesión
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Configuración para deserializar al usuario a partir de una sesión
  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findOne({ _id: id });
    done(null, user);
  });

  // Configuración de la estrategia de autenticación de GitHub
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: GITHUB_ID,
        clientSecret: GITHUB_SECRET,
        callbackURL: "http://localhost:8080/auth/githubcallback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Buscamos si el usuario ya existe en la base de datos
          const user = await userModel.findOne({
            email: profile.emails[0].value,
          });

          // Creamos un nuevo carrito
          const newCart = await serviceAddCart();

          if (!user) {
            // Si el usuario no existe, lo creamos
            let newUser = {
              first_name: profile._json.login,
              last_name: " ",
              age: 21,
              email: profile.emails[0].value,
              password: " ",
              cartId: newCart._id,
              lastLoginDate: new Date(),
            };
            let res = await userModel.create(newUser);
            done(null, res);
          } else {
            // Si el usuario ya existe, actualizamos la fecha de último inicio de sesión
            await userModel.findOneAndUpdate(
              { email: profile.emails[0].value },
              { lastLoginDate: new Date() },
              { new: true }
            );
            done(null, user);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );
};

// Exportamos la función de inicialización de Passport
export default initializePassport;
