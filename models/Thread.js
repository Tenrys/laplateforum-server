const MyModel = require("@models/MyModel");

module.exports = class Thread extends MyModel {
  static get tableName() {
    return "threads";
  }

  static get idColumn() {
    return "id";
  }

  static relationMappings() {
    const { User, Post, Tag } = require("@models");

    return {
      author: {
        relation: MyModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "threads.userId",
          to: "users.id",
        },
      },
      posts: {
        relation: MyModel.HasManyRelation,
        modelClass: Post,
        join: {
          from: "threads.id",
          to: "posts.threadId",
        },
      },
      tags: {
        relation: MyModel.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: "threads.id",
          through: {
            from: "threadTags.threadId",
            to: "threadTags.tagName",
          },
          to: "tags.name",
        },
      },
      subscribers: {
        relation: MyModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: "thread.id",
          through: {
            from: "threadSubscriptions.threadId",
            to: "threadSubscriptions.userId",
          },
          to: "users.id",
        },
      },
    };
  }
};
