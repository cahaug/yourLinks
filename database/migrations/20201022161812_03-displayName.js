
exports.up = function(knex, Promise) {
    return knex.schema
    .table('lists', list => {
        list.string('displayName', 128);
    })
  
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTableIfExists('lists');
};
