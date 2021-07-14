exports.up = function (knex) {
  return knex.schema.createTable("users", table => {
    table.increments("id");
    table.string("username").notNullable();
    table.string("password").notNullable();
    table.string("avatar").notNullable();
    table.string("status").notNullable();
    table.string("website").notNullable();
    table.string("twitter").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
