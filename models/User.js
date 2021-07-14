const MyModel = require("@models/MyModel");
const bcrypt = require("bcrypt");

module.exports = class User extends MyModel {
  static unsafeFields = ["password"];

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

    await this.$query().patch({ password: hash });
  }

  async isValidPassword(password) {
    return await bcrypt.compare(password, this.password);
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
        threads: {
          relation: MyModel.HasManyRelation,
          modelClass: Post,
          join: {
            from: "users.id",
            to: "post.userId",
          },
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
