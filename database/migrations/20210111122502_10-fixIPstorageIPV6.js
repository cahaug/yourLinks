
exports.up = function(knex, Promise) {
    return knex.schema
    .alterTable('users', user => {
        user.string('userIP', 130).alter();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
    .alterTable('users', user => {
        user.string('userIP', 16).alter();
    });
};
