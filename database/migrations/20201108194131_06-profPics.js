
exports.up = function(knex, Promise) {
    return knex.schema
    .table('users', user => {
        user.string('shackImageId')
    })
    .table('entries', entry => {
        entry.string('shackImageId')
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('users')
};
