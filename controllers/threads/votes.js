const { User, Thread, Post, Vote } = require("@models");
const { authenticate, validate, Joi } = require("@/utils");

module.exports = threads => {
  threads.post("/:id/:postId/vote", authenticate, async (req, res, next) => {
    const { id, postId } = req.params;
    const { up } = req.body;

    let vote = await Post.relatedQuery("votes").for(postId).where({ userId: req.user.id }).first();
    if (!vote) {
      vote = await Vote.query().insert({
        postId,
        userId: req.user.id,
        up,
      });
    } else {
      vote = await vote.$query().updateAndFetch({
        up,
      });
    }

    return res.json(vote);
  });

  threads.delete("/:id/:postId/vote", authenticate, async (req, res, next) => {
    const { id, postId } = req.params;

    let vote = await Post.relatedQuery("votes").for(postId).where({ userId: req.user.id }).first();
    if (vote) {
      await vote.$query().delete();
    }

    return res.json({ success: true });
  });
};
