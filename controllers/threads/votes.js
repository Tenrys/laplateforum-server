const { Post, Vote } = require("@models");
const { authenticate, validate, Joi } = require("@/utils");

module.exports = threads => {
  threads.post(
    "/:id(\\d+)/:postId(\\d+)/vote",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
        postId: Joi.number().required(),
      }),
      body: Joi.object({ up: Joi.boolean().required() }),
    }),
    async (req, res, next) => {
      const { id, postId } = req.params;
      const { up } = req.body;

      let vote = await Post.relatedQuery("votes")
        .for(postId)
        .where({ userId: req.user.id })
        .first();
      if (!vote) {
        vote = await Vote.query().insertAndFetch({
          postId,
          userId: req.user.id,
          up,
        });
      } else {
        vote = await vote.$query().updateAndFetch({
          up,
        });
      }

      return res.json({ result: vote });
    }
  );

  threads.delete(
    "/:id(\\d+)/:postId(\\d+)/vote",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
        postId: Joi.number().required(),
      }),
    }),
    async (req, res, next) => {
      const { id, postId } = req.params;

      let vote = await Post.relatedQuery("votes")
        .for(postId)
        .where({ userId: req.user.id })
        .first();
      if (vote) {
        await vote.$query().delete();
      }

      return res.json({ success: true });
    }
  );
};
