
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('pwReset', entry => {
        entry.increments('pwResetId');
        entry.string('email')
            .notNullable()
            .references('email')
            .inTable('users')
            .onDelete('RESTRICT')
            .onUpdate('RESTRICT');
        entry.string('resetCode', 7).notNullable();
        entry.string('creationGetTime', 14).notNullable();
        entry.string('expirationGetTime', 14).notNullable();
        entry.integer('sendAttempts', 2).notNullable().defaultTo(0);
        entry.integer('codeAttempts', 2).notNullable().defaultTo(0);
    })
    .table('users', users => {
        users.boolean('lockedOut').notNullable().defaultTo(false)
    })
};

exports.down = function(knex) {
  
};
