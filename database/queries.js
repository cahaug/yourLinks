const knex = require('./knex');

module.exports = { 
    getAllUsers(){
        return knex('users');
    },

    getNewUser(){
        return knex('users')
    },

    insertUser(user){
        return knex('users').insert(user);
    },

    singleUserForLogin(email){
        return knex('users').where("email", email);
    },

    getListByUser(userId){
        return knex('lists').where("userId", userId).select('listId');
    },

    createList(list){
        return knex('lists').insert(list);
    },

    newEntry(entry){
        return knex('entries').insert(entry);
    },

    getEntries(userId){
        return knex('entries').where("userId", userId);
    },

    modifyEntryURl(entryId, referencingURL){
        return knex('entries').where({ entryId }).update({ referencingURL })
    },

    getAllEntries(){
        return knex('entries')
    },

    updateDescription(entryId, description){
        return knex('entries').where({ entryId }).update({ description })
    }

}