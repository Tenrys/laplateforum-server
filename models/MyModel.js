const { Model } = require("objection");

module.exports = class MyModel extends Model {
  $formatJson(json) {
    json = super.$formatJson(json);

    if (Array.isArray(this.constructor.unsafeFields)) {
      for (const field of Object.keys(json)) {
        if (this.constructor.unsafeFields.includes(field)) delete json[field];
      }
    }

    return json;
  }
};
