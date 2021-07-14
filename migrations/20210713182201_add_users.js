exports.up = knex => {
  return knex.schema.createTable("users", table => {
    table.increments("id");
    table.string("username").notNullable();
    table.string("password").notNullable();
    table.string("avatar");
    table.string("status");
    table.string("website");
    table.string("twitter");
    table.timestamps(true, true);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("users");
};
