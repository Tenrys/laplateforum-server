exports.up = knex => {
  return knex.schema.createTable("tags", table => {
    table.string("name").primary().notNullable();
    table.timestamps(true, true);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("tags");
};
