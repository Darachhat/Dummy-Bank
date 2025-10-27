exports.up = function(knex) {
  return knex.schema
    .createTable('accounts', function(table) {
      table.increments('id').primary();
      table.integer('user_id').notNullable().index();
      table.string('type').notNullable().defaultTo('saving');
      table.string('number').notNullable().unique();
      table.decimal('balance', 14, 2).defaultTo(0);
      table.json('metadata').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .then(function() {
      return knex.schema.createTable('payments', function(table) {
        table.increments('id').primary();
        table.string('invoice_no').nullable().index();
        table.decimal('amount', 14, 2).nullable();
        table.string('status', 50).notNullable().defaultTo('PAID');
        table.string('transaction_id').notNullable().unique();
        table.timestamp('paid_at').nullable();
        table.integer('from_account_id').nullable().index();
        table.integer('to_account_id').nullable().index();
        table.json('metadata').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('payments')
    .then(function() {
      return knex.schema.dropTableIfExists('accounts');
    });
};
