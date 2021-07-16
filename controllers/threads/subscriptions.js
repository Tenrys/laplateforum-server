const { Thread } = require("@models");
const { authenticate, validate, Joi } = require("@/utils");

module.exports = threads => {
  threads.post(
    "/:id(\\d+)/subscribe",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
    }),
    async (req, res, next) => {
      const { id } = req.params;

      const subsQuery = Thread.relatedQuery("subscribers").for(id);
      if (!(await subsQuery.findById(req.user.id))) {
        await subsQuery.relate(req.user.id);
      }

      return res.json({ success: true });
    }
  );
  threads.post(
    "/:id(\\d+)/unsubscribe",
    authenticate,
    validate({
      params: Joi.object({
        id: Joi.number().required(),
      }),
    }),
    async (req, res, next) => {
      const { id } = req.params;

      await Thread.relatedQuery("subscribers").for(id).unrelate().where({ id: req.user.id });

      return res.json({ success: true });
    }
  );
};
