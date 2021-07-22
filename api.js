const { logger } = require("@/logger").scoped("API");

const { Router, json, urlencoded, static } = require("express");
const passport = require("passport");
const { knex, models } = require("@/db");
const path = require("path");
const cors = require("cors");

module.exports = app => {
  logger.wait("Setting up");
  const api = new Router();
  app.use(cors());
  api.use(json());
  api.use(urlencoded({ extended: true }));
  api.use(passport.initialize());
  api.uploadsPath = path.join(__dirname, "uploads");
  api.assetsPath = path.join(__dirname, "assets");

  for (const { path, provider } of require("./controllers")) {
    logger.wait(`Loading ${path}`);
    api.use(path, provider(api));
    logger.success(`Loaded ${path}`);
  }

  app.use("/api/v1", api);

  app.use("/uploads", static(api.uploadsPath));
  app.use("/assets", static(api.assetsPath));

  logger.success("Ready");
};
