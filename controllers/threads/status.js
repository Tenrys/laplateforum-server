const { Thread } = require("@models");
const { authenticate, validate, Joi, hasThreadPermission } = require("@/utils");

module.exports = threads => {
  threads.post(
    "/:id(\\d+)/close",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
    }),
    hasThreadPermission,
    async (req, res, next) => {
      const { id } = req.params;

      const thread = await Thread.query().updateAndFetchById(id, { closed: true });

      return res.json({ result: thread });
    }
  );
  threads.post(
    "/:id(\\d+)/open",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
    }),
    hasThreadPermission,
    async (req, res, next) => {
      const { id } = req.params;

      const thread = await Thread.query().updateAndFetchById(id, { closed: false });

      return res.json({ result: thread });
    }
  );
};
