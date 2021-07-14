const MyModel = require("@models/MyModel");

module.exports = class Role extends MyModel {
  static get tableName() {
    return "roles";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const { User } = require("@models");

    return {
      users: {
        relation: MyModel.BelongsToManyRelation,
        modelClass: User,
        join: {
          from: "users.roleId",
          to: "roles.id",
        },
      },
    };
  }
};
