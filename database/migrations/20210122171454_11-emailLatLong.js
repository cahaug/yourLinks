
exports.up = function(knex, Promise) {
    return knex.schema
    .table('stats', entry => {
        entry.string('latitude',12);
        entry.string('longitude', 12);
    })
    .table('pageViews', entry => {
        entry.string('latitude',12);
        entry.string('longitude',12);
    })
    .table('homepageViews', view => {
        view.string('latitude',12);
        view.string('longitude',12);
    })
    .createTable('emailRegistry', entry => {
        entry.increments('emailRegistryId');
        entry.integer('userId')
            .notNullable()
            .references('userId')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        entry.string('jarEmail', 255).defaultTo(' ');
        entry.string('jarAddress',255).defaultTo(' ');
        entry.string('jarPhone', 50).defaultTo(' ');
        entry.string('jarName', 128).defaultTo(' ');
        entry.string('jarDetail').defaultTo(' ');
        entry.string('mark1',255).defaultTo(' ');
        entry.string('mark2',255).defaultTo(' ');
        entry.string('contactType',255).defaultTo(' ');
        entry.string('initialProvince', 255).defaultTo(' ');
        entry.string('initialCountry', 255).defaultTo(' ');
        entry.integer('dy',2).notNullable();
        entry.integer('mo',2).notNullable();
        entry.integer('yr',4).notNullable();
        entry.integer('hr',2).notNullable();
        entry.integer('mn',2).notNullable();
        entry.integer('sc',2).notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('emailRegistry');
};
