
exports.up = function(knex, Promise) {
    return knex.schema
    .table('stats', entry => {
        entry.boolean('isMobileDevice');
        entry.string('deviceType', 30);
        entry.string('deviceBrandName', 30);
        entry.string('deviceOwnName', 35);
        entry.string('osName', 35);
        entry.string('osFamily', 35);
        entry.string('browserName', 35);
        entry.string('browserVersionMajor', 35);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema;
};
