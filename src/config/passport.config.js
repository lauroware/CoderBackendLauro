import passport from "passport";
import GitHubStrategy from "passport-github2";
import { userModel } from "../models/users.model.js";
import { serviceAddCart } from "../services/cart.js";
import { GITHUB_ID, GITHUB_SECRET } from "./index.config.js";

const initializePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findOne({ _id: id });
    done(null, user);
  });

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
          const user = await userModel.findOne({
            email: profile.emails[0].value,
          });
          const newCart = await serviceAddCart();
          if (!user) {
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
            await userModel.findOneAndUpdate(
              ({ email: profile.emails[0].value },
              { lastLoginDate: new Date() },
              { new: true })
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

export default initializePassport;
