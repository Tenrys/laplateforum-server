exports.up = function (knex) {
  return knex.schema.createTable("thread_tags", table => {
    table.integer("thread_id").unsigned().notNullable();
    table
      .foreign("thread_id")
      .references("id")
      .inTable("threads")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.integer("tag_id").unsigned().notNullable();
    table
      .foreign("tag_id")
      .references("id")
      .inTable("tags")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("thread_tags");
};
