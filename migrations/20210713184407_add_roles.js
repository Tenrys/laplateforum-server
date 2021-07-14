exports.up = knex => {
  return knex.schema
    .createTable("roles", table => {
      table.increments("id");
      table.string("name").notNullable();
      table.string("description").notNullable();
      table.boolean("is_admin").notNullable().defaultTo(false);
      table.timestamps(true, true);
    })
    .table("users", table => {
      table.integer("role_id").unsigned().notNullable().defaultTo(1);
      table.foreign("role_id").references("id").inTable("roles");
    });
};

exports.down = knex => {
  return knex.schema.dropTable("roles").table("users", table => {
    table.dropColumn("role_id");
  });
};
