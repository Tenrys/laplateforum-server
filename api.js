const { logger } = require("@/logger").scoped("API");

const { Router, json, urlencoded } = require("express");
const passport = require("passport");
const { knex, models } = require("@/db");

module.exports = app => {
  logger.wait("Setting up");
  const api = new Router();
  api.use(json());
  api.use(urlencoded({ extended: true }));
  api.use(passport.initialize());

  for (const { path, provider } of require("./controllers")) {
    logger.wait(`Loading ${path}`);
    api.use(path, provider(api));
    logger.success(`Loaded ${path}`);
  }

  app.use("/api/v1", api);
  logger.success("Ready");
};
