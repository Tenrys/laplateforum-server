const { Router } = require("express");
const { User, Thread, Post } = require("@models");
const { authenticate, validate, Joi } = require("@/utils");
const httpErrors = require("http-errors");

// TODO: i18n Joi?

module.exports = api => {
  threads = new Router();

  // Get all or one threads
  threads.get("/:id?", async (req, res, next) => {
    const { id } = req.params;

    let query = Thread.query();
    if (id) query = query.findById(id);
    query = query.withGraphFetched("[author, tags, posts]");
    const threads = await query;

    return res.json(threads);
  });

  // Create a new thread
  threads.post(
    "/",
    authenticate,
    validate({
      body: Joi.object({
        title: Joi.string().min(8).required(),
        body: Joi.string().min(8).required(),
      }),
    }),
    async (req, res, next) => {
      const { title, body } = req.body;

      const author = await User.query().findById(req.user.id);
      const thread = await Thread.query().insertGraphAndFetch(
        {
          title,
          author,
          posts: [{ body, author }],
        },
        { relate: true }
      );

      return res.json(thread);
    }
  );

  // Reply to a thread
  threads.post(
    "/:id",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
      body: Joi.object({
        body: Joi.string().min(8).required(),
      }),
    }),
    async (req, res, next) => {
      const { id } = req.params;
      const { body } = req.body;

      const author = await User.query().findById(req.user.id);
      const post = await Thread.query().upsertGraphAndFetch(
        { id, posts: [{ body, author }] },
        { relate: true }
      );

      return res.json(post);
    }
  );

  const hasPermission = async (req, res, next) => {
    const user = await User.query().findById(req.user.id).withGraphFetched("role");
    const { id, postId } = req.params;

    if (user.role.isAdmin) {
      return next();
    }
    if (postId) {
      const post = await Post.query().findById(postId).withGraphFetched("author");
      if (!post) return next(httpErrors(404));
      if (post.author.id !== user.id) return next(httpErrors(403));
    } else if (id) {
      const thread = await Thread.query().findById(id).withGraphFetched("author");
      if (!thread) return next(httpErrors(404));
      if (thread.author.id !== user.id) return next(httpErrors(403));
    }
    return next();
  };

  // Edit a post
  threads.put(
    "/:id/:postId",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
        postId: Joi.number().required(),
      }),
      body: Joi.object({
        body: Joi.string().min(8).required(),
      }),
    }),
    hasPermission,
    async (req, res, next) => {
      const { id, postId } = req.params;
      const { body } = req.body;

      const post = await Post.query().findById(postId).updateAndFetch({ body });

      return res.json(post);
    }
  );

  // Delete a post
  threads.delete(
    "/:id/:postId",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
        postId: Joi.number().required(),
      }),
    }),
    hasPermission,
    async (req, res, next) => {
      const { id, postId } = req.params;

      await Post.query().findById(postId).delete();

      return res.json({ success: true });
    }
  );

  // Edit a thread
  threads.put(
    "/:id",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
      body: Joi.object({
        title: Joi.string().min(8).required(),
        body: Joi.string().min(8).required(),
      }),
    }),
    hasPermission,
    async (req, res, next) => {
      const { id } = req.params;
      const { title, body } = req.body;

      const post = await Thread.relatedQuery("posts").for(id).first();
      const thread = await Thread.query().upsertGraphAndFetch(
        { id, title, posts: [{ id: post.id, body }] },
        { relate: true }
      );

      return res.json(thread);
    }
  );

  // Delete a thread
  threads.delete(
    "/:id",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
    }),
    hasPermission,
    async (req, res, next) => {
      const { id } = req.params;

      await Thread.query().findById(id).delete();

      return res.json({ success: true });
    }
  );

  require("./votes")(threads);

  return threads;
};
