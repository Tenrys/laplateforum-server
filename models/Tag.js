const MyModel = require("@models/MyModel");

module.exports = class Tag extends MyModel {
  static get tableName() {
    return "tags";
  }

  static get idColumn() {
    return "name";
  }

  static get relationMappings() {
    const { Thread } = require("@models");

    return {
      threads: {
        relation: MyModel.ManyToManyRelation,
        modelClass: Thread,
        join: {
          from: "tags.name",
          through: {
            from: "threadTags.tagName",
            to: "threadTags.threadId",
          },
          to: "threads.id",
        },
      },
    };
  }
};
