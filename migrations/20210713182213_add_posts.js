exports.up = knex => {
  return knex.schema.createTable("posts", table => {
    table.increments("id");
    table.integer("user_id").unsigned().notNullable();
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.integer("thread_id").unsigned().notNullable();
    table
      .foreign("thread_id")
      .references("id")
      .inTable("threads")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.text("body").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("posts");
};
