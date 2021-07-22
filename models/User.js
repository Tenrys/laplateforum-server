const MyModel = require("@models/MyModel");
const bcrypt = require("bcrypt");
const { DateTime } = require("luxon");

module.exports = class User extends MyModel {
  static unsafeFields = ["password"];
  static online = [];

  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "id";
  }

  static async register(username, password) {
    const user = await this.query().insert({
      username,
      password: await bcrypt.hash(password, 8),
    });

    return user;
  }

  async setPassword(password) {
    const hash = await bcrypt.hash(password, 8);

    await this.$query().patch({
      password: hash,
      lastPasswordChange: DateTime.now().toSQL({ includeOffset: false }),
    });
  }

  async isValidPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  async editProfile(data, avatar) {
    const { password, status, website, twitter } = data;
    if (avatar) avatar = avatar.filename;
    let passwordHash;

    if (password && !(await this.isValidPassword(password))) {
      passwordHash = await bcrypt.hash(password, 8);
    }

    return await this.$query()
      .patchAndFetch({
        password: passwordHash,
        status,
        website,
        twitter,
        avatar,
        ...{
          lastPasswordChange: !!passwordHash
            ? DateTime.now().toSQL({ includeOffset: false })
            : undefined,
        },
      })
      .withGraphFetched("role");
  }

  async getStats() {
    const threads = await this.$relatedQuery("threads")
      .count("user_id")
      .first()
      .then(res => Object.values(res)[0]);
    const posts = await this.$relatedQuery("posts")
      .count("user_id")
      .first()
      .then(res => Object.values(res)[0]);
    const votes = await this.$relatedQuery("votes")
      .count("user_id")
      .first()
      .then(res => Object.values(res)[0]);

    return { threads, posts, votes };
  }

  static get relationMappings() {
    const { Thread, Post, Vote, Role } = require("@models");

    return {
      role: {
        relation: MyModel.HasOneRelation,
        modelClass: Role,
        join: {
          from: "users.roleId",
          to: "roles.id",
        },
      },
      threads: {
        relation: MyModel.HasManyRelation,
        modelClass: Thread,
        join: {
          from: "users.id",
          to: "threads.userId",
        },
      },
      posts: {
        relation: MyModel.HasManyRelation,
        modelClass: Post,
        join: {
          from: "users.id",
          to: "posts.userId",
        },
      },
      votes: {
        relation: MyModel.HasManyRelation,
        modelClass: Vote,
        join: {
          from: "users.id",
          to: "votes.userId",
        },
      },
      subscriptions: {
        relation: MyModel.ManyToManyRelation,
        modelClass: Thread,
        join: {
          from: "threadSubscriptions.userId",
          to: "threadSubscriptions.threadId",
        },
      },
    };
  }
};
