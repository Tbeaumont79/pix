const up = async function (knex) {
  await knex.schema.table('complementary-certification-subscriptions', function (table) {
    table.text('type').notNull().defaultTo('COMPLEMENTARY');
  });

  await knex.schema.dropView('certification-subscriptions');
  return knex.schema.createView('certification-subscriptions', function (view) {
    view.as(knex('complementary-certification-subscriptions'));
  });
};

const down = async function (knex) {
  await knex.schema.dropView('certification-subscriptions');
  return knex.schema.createView('certification-subscriptions', function (view) {
    view.as(knex('complementary-certification-subscriptions'));
  });
};

export { down, up };
