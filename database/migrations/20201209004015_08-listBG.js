
exports.up = function(knex, Promise) {
    return knex.schema
    .table('lists', list => {
        list.string('listBackgroundURL', 64);
        list.string('listBackgroundImageId', 12);
    })
};

exports.down = function(knex, Promise) {

};
