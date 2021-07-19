const { Router } = require("express");
const { User, Thread, Post } = require("@models");
const { authenticate, validate, Joi, hasThreadPermission, denyIfThreadClosed } = require("@/utils");

// TODO: i18n Joi?

module.exports = app => {
  const threads = new Router();

  // Get all or one threads
  threads.get("/:id(\\d+)?", async (req, res, next) => {
    const { id } = req.params;

    let query = Thread.query();
    if (id) query = query.findById(id);
    query = query.withGraphFetched("[author, tags, posts]");
    const threads = await query;

    return res.json({ result: threads });
  });

  // Create a new thread
  threads.post(
    "/",
    authenticate,
    validate({
      body: Joi.object({
        title: Joi.string().min(8).required(),
        body: Joi.string().min(8).required(),
        tags: Joi.array().items(
          Joi.string()
            .min(1)
            .pattern(/^[a-z0-9\-]*$/)
        ),
      }),
    }),
    async (req, res, next) => {
      const { title, body, tags } = req.body;

      const author = await User.query().findById(req.user.id);
      const thread = await Thread.create(author, title, body, tags);

      return res.json({ result: thread });
    }
  );

  // Reply to a thread
  threads.post(
    "/:id(\\d+)",
    authenticate,
    validate({
      body: Joi.object({
        body: Joi.string().min(8).required(),
      }),
    }),
    denyIfThreadClosed,
    async (req, res, next) => {
      const { id } = req.params;
      const { body } = req.body;

      const author = await User.query().findById(req.user.id);
      const post = await Thread.query().upsertGraphAndFetch(
        { id, posts: [{ body, author }] },
        { relate: true }
      );

      return res.json({ result: post });
    }
  );

  // Edit a post
  threads.put(
    "/:id(\\d+)/:postId(\\d+)",
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
    denyIfThreadClosed,
    hasThreadPermission,
    async (req, res, next) => {
      const { id, postId } = req.params;
      const { body } = req.body;

      const post = await Post.query().updateAndFetchById(postId, { body });

      return res.json({ result: post });
    }
  );

  // Delete a post
  threads.delete(
    "/:id(\\d+)/:postId(\\d+)",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
        postId: Joi.number().required(),
      }),
    }),
    denyIfThreadClosed,
    hasThreadPermission,
    async (req, res, next) => {
      const { id, postId } = req.params;

      await Post.query().findById(postId).delete();

      return res.json({ success: true });
    }
  );

  // Edit a thread
  threads.put(
    "/:id(\\d+)",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
      body: Joi.object({
        title: Joi.string().min(8).required(),
        body: Joi.string().min(8).required(),
        tags: Joi.array().items(
          Joi.string()
            .min(1)
            .pattern(/^[a-z0-9\-]*$/)
        ),
      }),
    }),
    denyIfThreadClosed,
    hasThreadPermission,
    async (req, res, next) => {
      const { id } = req.params;
      const { title, body, tags } = req.body;

      const thread = await Thread.query()
        .findById(id)
        .then(thread => thread.edit(title, body, tags));

      return res.json({ result: thread });
    }
  );

  // Delete a thread
  threads.delete(
    "/:id(\\d+)",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
    }),
    hasThreadPermission,
    async (req, res, next) => {
      const { id } = req.params;

      await Thread.query().findById(id).delete();

      return res.json({ success: true });
    }
  );

  require("./votes")(threads);
  require("./answers")(threads);
  require("./status")(threads);
  require("./subscriptions")(threads);

  return threads;
};
