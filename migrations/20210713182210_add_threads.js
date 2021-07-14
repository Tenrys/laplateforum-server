exports.up = knex => {
  return knex.schema.createTable("threads", table => {
    table.increments("id");
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("id").inTable("users");
    table.string("title").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("threads");
};
