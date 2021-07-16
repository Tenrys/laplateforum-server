exports.up = knex => {
  return knex.schema.table("threads", table => {
    table.boolean("closed").notNullable().defaultTo(false);
  });
};

exports.down = knex => {
  return knex.schema.table("threads", table => {
    table.dropColumn("closed");
  });
};
