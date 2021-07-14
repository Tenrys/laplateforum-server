const MyModel = require("@models/MyModel");

module.exports = class Post extends MyModel {
  static get tableName() {
    return "posts";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const { Thread, User, Vote } = require("@models");

    return {
      thread: {
        relation: MyModel.BelongsToOneRelation,
        modelClass: Thread,
        join: {
          from: "posts.threadId",
          to: "threads.id",
        },
      },
      author: {
        relation: MyModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "posts.userId",
          to: "users.id",
        },
      },
      votes: {
        relation: MyModel.HasManyRelation,
        modelClass: Vote,
        join: {
          from: "posts.id",
          to: "votes.postId",
        },
      },
    };
  }
};
