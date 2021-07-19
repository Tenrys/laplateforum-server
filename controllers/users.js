const { Router } = require("express");
const { User } = require("@models");
const { authenticate, validate, Joi, isAdmin } = require("@/utils");
const multer = require("multer");
const path = require("path");

const validMimetypes = ["image/jpeg", "image/png"];
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now() + "-" + Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  fileFilter(req, file, cb) {
    if (validMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("MIME type not allowed"), false);
    }
  },
});

module.exports = app => {
  const users = new Router();

  users.get("/:id(\\d+)", async (req, res, next) => {
    const { id } = req.params;

    const user = await User.query().findById(id).withGraphFetched("role");

    return res.json({ result: user });
  });

  users.get("/:id(\\d+)/avatar", async (req, res, next) => {
    const { id } = req.params;

    const { avatar } = await User.query().findById(id);

    return res.sendFile(path.join(app.uploadsPath, avatar));
  });

  users.get("/online", async (req, res, next) => {
    const { online } = User;

    return res.json({ online });
  });

  users.get("/:id(\\d+)/threads", async (req, res, next) => {
    const { id } = req.params;

    const user = await User.relatedQuery("threads").for(id);

    return res.json({ result: user });
  });

  users.get("/:id(\\d+)/posts", async (req, res, next) => {
    const { id } = req.params;

    const user = await User.relatedQuery("posts").for(id);

    return res.json({ result: user });
  });

  users.get("/:id(\\d+)/stats", async (req, res, next) => {
    const { id } = req.params;

    const user = await User.query()
      .findById(id)
      .then(user => user.getStats());

    return res.json({ result: user });
  });

  users.get("/me", authenticate, async (req, res, next) => {
    const id = req.user.id;

    const user = await User.query().findById(id).withGraphFetched("role");

    return res.json({ result: user });
  });

  users.post(
    "/me",
    authenticate,
    upload.single("avatar"),
    validate({
      body: Joi.object({
        password: Joi.string().min(8).max(128),
        status: Joi.string().min(1).max(32).allow(null),
        website: Joi.string().uri().allow(null),
        twitter: Joi.string().min(1).max(15).allow(null),
      }),
    }),
    async (req, res, next) => {
      const id = req.user.id;

      const user = await User.query()
        .findById(id)
        .then(user => user.editProfile(req.body, req.file));

      return res.json({ result: user });
    }
  );

  users.post(
    "/:id(\\d+)/role",
    authenticate,
    isAdmin,
    validate({ body: Joi.object({ roleId: Joi.number().required() }) }),
    async (req, res, next) => {
      const { id } = req.params;
      const { roleId } = req.body;

      const user = await User.query()
        .findById(id)
        .then(user => user.$query().patchAndFetch({ roleId }));

      return res.json({ result: user });
    }
  );

  return users;
};
