const { Router } = require("express");
const passport = require("passport");
const { User } = require("@models");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy,
  ExtractJWT = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const { validate, Joi } = require("@/utils");

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await User.query().findOne({ username });
        if (user) {
          if (user.username == username)
            return done(null, false, { message: "Username already exists" });
        }

        const newUser = await User.register(username, password);

        return done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        user = await User.query().findOne({ username });
        if (!user) {
          return done(null, false, { message: "Wrong password" }); // we shouldn't tell them anything special
        }

        const valid = await user.isValidPassword(password);
        if (!valid) {
          return done(null, false, { message: "Wrong password" });
        }

        return done(null, user, { message: "Logged in successfully" });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// TODO: Implement refresh tokens
passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = api => {
  auth = new Router();

  const validator = validate(
    {
      body: Joi.object({
        username: Joi.string().alphanum().min(2).max(32).required(),
        password: Joi.string().required().min(8).max(128),
      }),
    },
    { keyByField: true },
    { abortEarly: false }
  );
  auth.post("/register", validator, async (req, res, next) => {
    passport.authenticate("register", { session: false }, async (err, user, info) => {
      try {
        if (err || !user) {
          if (info) return res.status(400).json(info);
          else return next(err);
        }

        res.json({
          success: true,
          message: "Registration successful",
          user: req.user,
        });
      } catch (err) {
        return next(err);
      }
    })(req, res, next);
  });

  const loginCallback = (res, user) => async err => {
    if (err) return next(err);

    const body = { id: user.id, username: user.username };
    const token = jwt.sign({ user: body }, process.env.JWT_SECRET);

    return res.json({ success: true, token, user });
  };

  auth.post("/login", validator, async (req, res, next) => {
    return passport.authenticate("login", async (err, user, info) => {
      try {
        if (err || !user) {
          if (info) {
            switch (info.message) {
              case "Wrong password":
                return res.status(400).json(info);
            }
          } else {
            return next(err);
          }
        }

        return req.login(user, { session: false }, loginCallback(res, user));
      } catch (err) {
        return next(err);
      }
    })(req, res, next);
  });

  return auth;
};
