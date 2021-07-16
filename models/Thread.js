const MyModel = require("@models/MyModel");
const getUrls = require("get-urls");

module.exports = class Thread extends MyModel {
  static unsafeFields = ["subscribers"];

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

  static async create(author, title, body, tags) {
    let thread = await this.query().insertGraph(
      {
        author,
        title,
        posts: [{ author, body }],
      },
      { relate: true }
    );
    if (tags) await thread.updateTags(tags);
    return thread.$query().withGraphFetched("[tags, posts]");
  }

  async edit(title, body, tags) {
    await this.$query().update({ title });
    await this.$relatedQuery("posts").first().update({ body });
    if (tags) await this.updateTags(tags);
    return this.$query().withGraphFetched("tags");
  }

  async updateTags(tags) {
    const { Tag } = require("@models");

    const currentTags = await this.$relatedQuery("tags");
    const currentTagNames = currentTags.map(tag => tag.name);
    const newTags = tags.filter(tag => !currentTagNames.includes(tag));
    const missingTags = currentTagNames.filter(tag => !newTags.includes(tag));

    for (const newTag of newTags) {
      const tag = await Tag.query().findById(newTag);
      if (!tag) {
        await this.$relatedQuery("tags").insert({ name: newTag });
      } else {
        await this.$relatedQuery("tags").relate(newTag);
      }
    }
    for (const missingTag of missingTags) {
      const tag = currentTags.find(({ name }) => name === missingTag);
      await tag.$relatedQuery("threads").for([this, tag]).unrelate();

      const uses = (await tag.$relatedQuery("threads")).length;
      if (uses <= 0) {
        await tag.$query().delete();
      }
    }
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
          from: "threads.id",
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
