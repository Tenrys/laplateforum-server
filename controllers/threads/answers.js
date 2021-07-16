const { Thread } = require("@models");
const { authenticate, validate, Joi, hasThreadPermission } = require("@/utils");

module.exports = threads => {
  threads.post(
    "/:id/:postId/answer",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
        postId: Joi.number().required(),
      }),
    }),
    hasThreadPermission,
    async (req, res, next) => {
      const { id, postId } = req.params;

      const post = await Thread.query().updateAndFetchById(id, { answerId: postId });

      return res.json({ result: post });
    }
  );

  threads.delete(
    "/:id/answer",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
    }),
    hasThreadPermission,
    async (req, res, next) => {
      const { id } = req.params;

      const post = await Thread.query().updateAndFetchById(id, { answerId: null });

      return res.json({ result: post });
    }
  );
};
