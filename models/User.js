const MyModel = require("@models/MyModel");
const bcrypt = require("bcrypt");

module.exports = class User extends MyModel {
  static safeFields = ["id", "username"];

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "id";
  }

  async setPassword(password) {
    const hash = await bcrypt.hash(password, 8);

    await this.$query().patch({ encryptedPassword: hash });
  }

  async isValidPassword(password) {
    return await bcrypt.compare(password, this.encryptedPassword);
  }
};
