
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('homepageViews', view => {
        view.increments('homepageViewId');
        view.integer('dy', 2).notNullable();
        view.integer('mo', 2).notNullable();
        view.integer('yr', 4).notNullable();
        view.integer('hr', 2).notNullable();
        view.integer('mn', 2).notNullable();
        view.integer('sc', 2).notNullable();
        view.string('countryOfOrigin', 4);
        view.string('province', 128);
        view.string('deviceType', 30);
        view.string('deviceBrandName', 30);
        view.string('deviceOwnName', 35);
        view.string('osName', 35);
        view.string('osFamily', 35);
        view.string('browserName', 35);
        view.string('browserVersionMajor', 35);
        view.boolean('isMobileDevice');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTableIfExists('homepageViews');
};
