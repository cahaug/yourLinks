
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('users', user => {
        user.increments('userId');
        user.string('email', 128)
            .notNullable()
            .unique();
        user.string('password', 128).notNullable();
        user.string('firstName', 128).notNullable();
        user.string('lastName', 128).notNullable();
        user.string('creationDate', 128).notNullable();
    })
    .createTable('lists', list => {
        list.increments('listId');
        list.integer('userId')
            .unsigned()
            .notNullable()
            .references('userId')
            .inTable('users')
            .onDelete('RESTRICT')
            .onUpdate('RESTRICT');
        list.string('creationDate', 128).notNullable();
        list.string('backColor', 128).notNullable().defaultTo('#ffffff');
        list.string('txtColor', 128).notNullable().defaultTo('#000000');
        list.string('fontSelection', 128).notNullable().defaultTo('Roboto');
    })
    .createTable('entries', entry => {
        entry.increments('entryId');
        entry.integer('listId')
            .unsigned()
            .notNullable()
            .references('listId')
            .inTable('lists')
            .onDelete('RESTRICT')
            .onUpdate('RESTRICT');
        entry.string('referencingURL', 500).notNullable();
        entry.string('description',500);
        entry.string('linkTitle', 500).notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('entries')
        .dropTableIfExists('lists')
        .dropTableIfExists('users');
};
