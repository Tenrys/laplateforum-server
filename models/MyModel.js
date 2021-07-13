const { Model } = require("objection");

module.exports = class MyModel extends Model {
  toSafeJSON() {
    const data = {};

    for (const field of this.constructor.safeFields) {
      data[field] = this[field];
    }

    return data;
  }
};
