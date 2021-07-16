const { validate, Joi } = require("express-validation");
const passport = require("passport");
const { User } = require("@models");
const httpErrors = require("http-errors");

exports.missingKeys = obj => {
  return Object.keys(obj)
    .filter(x => !!!obj[x])
    .join(", ");
};
exports.hasAllKeys = obj => {
  return Object.keys(obj).filter(key =>
    Object.keys(obj)
      .filter(val => obj[val])
      .includes(key)
  );
};
exports.validate = obj => {
  return validate(obj, { keyByField: true }, { abortEarly: false });
};
exports.Joi = Joi;
exports.authenticate = async (req, res, next) => {
  return passport.authenticate("jwt", async (err, user) => {
    try {
      if (err || !user) {
        return next(err);
      }
      if (!(await User.query().findById(user.id))) {
        return next(httpErrors(401, "User not found"));
      }

      return req.login(user, { session: false }, next);
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
};
