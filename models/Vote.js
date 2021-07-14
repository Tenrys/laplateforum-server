const MyModel = require("@models/MyModel");

module.exports = class Vote extends MyModel {
  static get tableName() {
    return "votes";
  }

  static get idColumn() {
    return ["userId", "postId"];
  }

  static get relationMappings() {
    const { User, Post } = require("@models");

    return {
      author: {
        relation: MyModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "votes.userId",
          to: "users.id",
        },
      },
      post: {
        relation: MyModel.BelongsToOneRelation,
        modelClass: Post,
        join: {
          from: "votes.postId",
          to: "posts.id",
        },
      },
    };
  }
};
