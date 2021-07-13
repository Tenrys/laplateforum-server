const { logger } = require("@/logger").scoped("Models");

try {
  logger.wait("Loading models");
  module.exports = {
    User: require("@models/User"),
  };
} catch (err) {
  logger.fatal(err);
  process.exit(1);
}

logger.success("Loaded models");
