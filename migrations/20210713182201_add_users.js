exports.up = function (knex) {
  knex.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("username").notNullable();
    table.string("password").notNullable();
    table.string("avatar").notNullable();
    table.string("status").notNullable();
    table.string("website").notNullable();
    table.string("twitter").notNullable();
    table.integer("role").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {};
