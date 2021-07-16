const MyModel = require("@models/MyModel");
const getUrls = require("get-urls");

module.exports = class Thread extends MyModel {
  static get tableName() {
    return "threads";
  }

  static get idColumn() {
    return "id";
  }

  async $afterFind() {
    const posts = await this.$relatedQuery("posts").withGraphFetched("author"); // [posts, posts.author] would have worked too
    this.links = posts.map(post => Array.from(getUrls(post.body))).flat();
    this.participantCount = posts
      .map(post => post.author.id)
      .filter((id, index, self) => self.indexOf(id) === index).length;
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
