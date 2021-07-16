exports.up = knex => {
  return knex.schema
    .table("thread_tags", table => {
      table.primary(["thread_id", "tag_name"]);
    })
    .table("thread_subscriptions", table => {
      table.primary(["user_id", "thread_id"]);
    })
    .table("votes", table => {
      table.primary(["user_id", "post_id"]);
    });
};

exports.down = knex => {
  return knex.schema
    .table("thread_tags", table => {
      table.dropPrimary(["thread_id", "tag_name"]);
    })
    .table("thread_subscriptions", table => {
      table.dropPrimary(["user_id", "thread_id"]);
    })
    .table("votes", table => {
      table.dropPrimary(["user_id", "post_id"]);
    });
};
