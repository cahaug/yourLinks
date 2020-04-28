
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
        user.string('referredBy', 128);
        user.string('profilePictureURL',500);
        user.string('stripeCustomerId',128);
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
        list.integer('listViews', 128).notNullable().defaultTo(0);
        list.string('customURL', 128).unique();
        list.boolean('displayUserInfo').defaultTo(true);
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
        entry.integer('userId')
            .unsigned()
            .notNullable()
            .references('userId')
            .inTable('users')
            .onDelete('RESTRICT')
            .onUpdate('RESTRICT');
        entry.string('creationDate', 128).notNullable();
        entry.text('referencingURL', 500).notNullable();
        entry.string('description',500);
        entry.string('linkTitle', 500).notNullable();
        entry.string('imgURL', 500);
    })
    .createTable('stats', entry => {
        entry.increments('statId')
        entry.integer('entryId')
            .unsigned()
            .notNullable()
            .references('entryId')
            .inTable('entries')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')
        entry.integer('dy', 2).unsigned().notNullable();
        entry.integer('mo', 2).notNullable();
        entry.integer('yr', 4).notNullable();
        entry.integer('hr', 2).notNullable();
        entry.integer('mn', 2).notNullable();
        entry.integer('sc', 2).notNullable();
        
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('stats')
        .dropTableIfExists('entries')
        .dropTableIfExists('lists')
        .dropTableIfExists('users');
};
