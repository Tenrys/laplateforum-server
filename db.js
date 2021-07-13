const { logger } = require("@/logger").scoped("database");

const path = require("path");
const Knex = require("knex");

try {
  logger.wait("Setting up");
  const knex = Knex(require(path.join(__dirname, "knexfile.js")));
  // const pg = knex.client.driver; // Could be useful later, I guess...
  // pg.types.setTypeParser(pg.types.builtins.DATE, val => /* ... */ );

  module.exports = { knex, models: require("@/models") };
} catch (err) {
  logger.fatal(err);
  process.exit(1);
}

logger.success("Ready");
