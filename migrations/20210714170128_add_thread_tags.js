exports.up = knex => {
  return knex.schema.createTable("thread_tags", table => {
    table.integer("thread_id").unsigned().notNullable();
    table
      .foreign("thread_id")
      .references("id")
      .inTable("threads")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("tag_name").notNullable();
    table
      .foreign("tag_name")
      .references("name")
      .inTable("tags")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.timestamps(true, true);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("thread_tags");
};
