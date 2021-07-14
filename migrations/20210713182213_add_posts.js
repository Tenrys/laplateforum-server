exports.up = function (knex) {
  return knex.schema.createTable("posts", table => {
    table.increments("id");
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("id").inTable("users");
    table.integer("thread_id").unsigned().notNullable();
    table.foreign("thread_id").references("id").inTable("threads");
    table.text("body").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("posts");
};
