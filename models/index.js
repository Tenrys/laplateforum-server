const { logger } = require("@/logger").scoped("Models");

try {
  logger.wait("Loading models");
  module.exports = {
    User: require("@models/User"),
    Role: require("@models/Role"),
    Thread: require("@models/Thread"),
    Tag: require("@models/Tag"),
    Post: require("@models/Post"),
    Vote: require("@models/Vote"),
  };
} catch (err) {
  logger.fatal(err);
  process.exit(1);
}

logger.success("Loaded models");
