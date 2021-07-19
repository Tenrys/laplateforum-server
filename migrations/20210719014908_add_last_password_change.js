exports.up = knex => {
  return knex.schema.table("users", table => {
    table.timestamp("last_password_change").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = knex => {
  return knex.schema.table("users", table => {
    table.dropColumn("last_password_change");
  });
};
