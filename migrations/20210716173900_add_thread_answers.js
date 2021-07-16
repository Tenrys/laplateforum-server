exports.up = knex => {
  return knex.schema.table("threads", table => {
    table.integer("answer_id").unsigned();
    table
      .foreign("answer_id")
      .references("id")
      .inTable("posts")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

exports.down = knex => {
  return knex.schema.table("threads", table => {
    table.dropForeign("answer_id");
    table.dropColumn("answer_id");
  });
};
