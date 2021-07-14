exports.up = function (knex) {
  return knex.schema.createTable("votes", table => {
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("id").inTable("users");
    table.integer("post_id").unsigned().notNullable();
    table.foreign("post_id").references("id").inTable("posts");
    table.boolean("up").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("votes");
};
