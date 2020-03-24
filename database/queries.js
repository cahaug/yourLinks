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

    
    getEntries2(userId){
        return knex('entries').where("userId", userId).orderBy('entryId', 'asc').leftJoin('stats', 'entries.entryId', 'stats.entryId').select('stats.entryId').count().groupBy('stats.entryId').orderBy('entries.entryId', 'asc');
    },

    listByCustomURL(customURL){
        return knex('lists').where("customURL", customURL);
    },
    // join('entries', 'lists.listId', 'entries.listId')
    checkIfCustomURLAvailable(customURL){
        return knex('lists').where("customURL", customURL);
    },

    // getEntries3(userId){
    //     return knex('entries').where("userId", userId) 
    //     'entries.description', 'entries.referencingURL', 'entries.creationDate', 'entries.linkTitle'
    //     .select('entries.entryId', 'entries.description', 'entries.referencingURL', 'entries.creationDate', 'entries.linkTitle')
    // .join({e: 'entries'}, 'stats.entryId', 'e.entryId').select('e.description', 'e.referencingURL', 'e.creationDate', 'e.linkTitle')
    // },

    modifyEntryURl(entryId, referencingURL){
        return knex('entries').where({ entryId }).update({ referencingURL })
    },

    getAllEntries(){
        return knex('entries').orderBy('entryId', 'asc')
    },

    updateDescription(entryId, description){
        return knex('entries').where({ entryId }).update({ description })
    },

    logAClick(stat){
        return knex('stats').insert(stat)
    },

    statsRecordsCount(){
        return knex('stats').count('statId as statId')
    },

    statsForEntry(entryId){
        return knex('stats').where({ entryId }).count('statId as clickCount')
    },

    statsRecords(){
        return knex('stats')
    },

    getListId(userId){
        return knex('lists').where({ userId }).select('userId', 'listId', 'customURL')
    },
    
    incrementListViews(listId, listViews){
        return knex('lists').where('listId', listId).update({'listViews': listViews})
    },

    listViewsGet(listId){
        return knex('lists').where('listId', listId).select('listViews')
    }
}