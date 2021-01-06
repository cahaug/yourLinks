
exports.up = function(knex, Promise) {
    return knex.schema
    .table('users', user => {
        user.string('updateURL');
        user.string('cancelURL');
    })
    .createTable('registration', entry => {
        entry.increments('registrantId');
        entry.integer('userId')
            .notNullable()
            .references('userId')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')
        entry.string('token').notNullable();
        entry.string('email').notNullable();
        entry.boolean('redeemed').defaultTo(false);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTableIfExists('registration');
};
