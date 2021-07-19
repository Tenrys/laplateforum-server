const { validate, Joi } = require("express-validation");
const passport = require("passport");
const { User, Post, Thread } = require("@models");
const httpErrors = require("http-errors");
const { DateTime } = require("luxon");

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
  return passport.authenticate("jwt", async (err, data, info) => {
    try {
      if (err || !data) {
        return next(info);
      }
      const user = await User.query().findById(data.id);
      if (!user) {
        return next(httpErrors(401, "User not found"));
      }
      const validDate =
        DateTime.fromJSDate(user.lastPasswordChange).toUTC() >
        DateTime.fromISO(data.lastPasswordChange).toUTC();
      if (!data.lastPasswordChange || validDate) {
        return next(httpErrors(403, "Invalid token"));
      }

      return req.login(user, { session: false }, next);
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
};
exports.hasThreadPermission = async (req, res, next) => {
  const role = await User.relatedQuery("role").for(req.user.id).first();
  const { id, postId } = req.params;

  if (role.isAdmin) {
    return next();
  }
  if (postId) {
    const author = await Post.relatedQuery("author").for(postId).first();
    if (!author) return next(httpErrors(404, "Post not found"));
    if (author.id !== user.id) return next(httpErrors(403, "This post doesn't belong to you"));
  } else if (id) {
    const author = await Thread.relatedQuery("author").for(id).first();
    if (!author) return next(httpErrors(404, "Thread not found"));
    if (author.id !== user.id) return next(httpErrors(403, "This thread doesn't belong to you"));
  }
  return next();
};
exports.denyIfThreadClosed = async (req, res, next) => {
  const role = await User.relatedQuery("role").for(req.user.id).first();
  const { id } = req.params;

  if (role.isAdmin) {
    return next();
  }
  if (id) {
    const thread = await Thread.query().findById(id);
    if (!thread) return next(httpErrors(404, "Thread not found"));
    if (thread.closed) return next(httpErrors(403, "This thread is closed"));
  }
  return next();
};
exports.isAdmin = async (req, res, next) => {
  const role = await User.relatedQuery("role").for(req.user.id).first();

  if (role.isAdmin) {
    return next();
  } else {
    return next(httpErrors(403));
  }
};
