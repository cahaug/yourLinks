
exports.up = function(knex, Promise) {
    return knex.schema
    .alterTable('stats', entry => {
        entry.string('userIP', 50).alter();
    })
    .alterTable('pageViews', entry => {
        entry.string('userIP', 50).alter();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
    .alterTable('stats', entry => {
        entry.string('userIP', 16).alter();
    })
    .alterTable('pageViews', entry => {
        entry.string('userIP', 16).alter();
    });
};
