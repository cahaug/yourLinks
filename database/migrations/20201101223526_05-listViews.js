
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('pageViews', entry => {
        entry.increments('pageViewId');
        entry.integer('listId')
            .notNullable()
            .references('listId')
            .inTable('lists')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        entry.integer('dy', 2).notNullable();
        entry.integer('mo', 2).notNullable();
        entry.integer('yr', 4).notNullable();
        entry.integer('hr', 2).notNullable();
        entry.integer('mn', 2).notNullable();
        entry.integer('sc', 2).notNullable();
        entry.string('userAgent', 230);
        entry.string('userIP', 16);
        entry.string('countryOfOrigin', 4);
        entry.string('province', 128);
        entry.string('deviceType', 30);
        entry.string('deviceBrandName', 30);
        entry.string('deviceOwnName', 35);
        entry.string('osName', 35);
        entry.string('osFamily', 35);
        entry.string('browserName', 35);
        entry.string('browserVersionMajor', 35);
        entry.boolean('isMobileDevice');
        entry.boolean('doNotTrack');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTableIfExists('pageViews');
};
