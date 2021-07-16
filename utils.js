const { validate, Joi } = require("express-validation");
const passport = require("passport");
const { User, Post, Thread } = require("@models");
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
  return passport.authenticate("jwt", async (err, user, info) => {
    try {
      if (err || !user) {
        return next(info);
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
exports.hasThreadPermission = async (req, res, next) => {
  const user = await User.query().findById(req.user.id).withGraphFetched("role");
  const { id, postId } = req.params;

  if (user.role.isAdmin) {
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
  const user = await User.query().findById(req.user.id).withGraphFetched("role");
  const { id } = req.params;

  if (user.role.isAdmin) {
    return next();
  }
  if (id) {
    const thread = await Thread.query().findById(id);
    if (!thread) return next(httpErrors(404, "Thread not found"));
    if (thread.closed) return next(httpErrors(403, "This thread is closed"));
  }
  return next();
};
