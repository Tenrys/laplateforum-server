exports.up = function (knex) {
  return knex.schema
    .createTable("roles", table => {
      table.increments("id");
      table.string("name").notNullable();
      table.string("description").notNullable();
      table.timestamps(true, true);
    })
    .table("users", table => {
      table.integer("role_id").unsigned().notNullable().references("id").inTable("roles");
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("roles").table("users", table => {
    table.dropColumn("role_id");
  });
};
