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
        return knex('entries').returning('*').insert(entry);
    },

    getEntries(userId){
        return knex('entries').where("entries.userId", userId).orderBy('listId', 'asc').orderBy('entryId', 'asc').join('users', 'entries.userId', 'users.userId').leftJoin('lists', 'entries.listId', 'lists.listId').select('users.firstName', 'users.lastName', 'users.profilePictureURL', 'entries.entryId', 'entries.listId', 'entries.creationDate', 'entries.referencingURL', 'entries.linkTitle', 'entries.description', 'entries.imgURL','lists.displayName', 'lists.backColor', 'lists.txtColor', 'lists.fontSelection').orderBy('entries.entryId', 'asc');
    },

    getEntries1(listId){
        return knex('entries').where("entries.listId", listId).orderBy('listId', 'asc').orderBy('entryId', 'asc').join('users', 'entries.userId', 'users.userId').select('users.firstName', 'users.lastName', 'users.profilePictureURL', 'users.displayUserInfo','entries.entryId', 'entries.listId', 'entries.creationDate', 'entries.referencingURL', 'entries.linkTitle', 'entries.description', 'entries.imgURL').orderBy('entries.entryId', 'asc');
    },
    
    getEntries2(userId){
        return knex('entries').where("userId", userId).leftJoin('stats', 'entries.entryId', 'stats.entryId').select('stats.entryId').orderBy('stats.entryId', 'asc').count().groupBy('stats.entryId').orderBy('stats.entryId', 'asc');
    },

    pieGraph(userId){
        return knex('entries').where("userId", userId).leftJoin('stats', 'entries.entryId', 'stats.entryId').select('stats.entryId').orderBy('stats.entryId', 'asc').count().groupBy('stats.entryId').orderBy('stats.entryId', 'asc');
    },

    putCustom(listId, customURL){
        return knex('lists').where("listId", listId).update({customURL:customURL})
    },

    listByCustomURL(customURL){
        return knex('lists').where("customURL", customURL).join('entries', 'lists.listId', 'entries.listId').orderBy('entries.entryId', 'asc').join('users', 'entries.userId', 'users.userId').select('users.firstName', 'users.lastName', 'users.profilePictureURL', 'entries.entryId', 'entries.listId', 'entries.creationDate', 'entries.referencingURL', 'entries.linkTitle', 'entries.description', 'entries.imgURL', 'lists.displayName', 'lists.creationDate', 'lists.backColor', 'lists.txtColor', 'lists.fontSelection').orderBy('entries.entryId', 'asc');
    },

    listByNumber(listId){
        return knex('lists').where("lists.listId", listId).join('entries', 'lists.listId', 'entries.listId').orderBy('entries.entryId', 'asc').join('users', 'entries.userId', 'users.userId').select('users.firstName', 'users.lastName', 'users.profilePictureURL', 'entries.entryId', 'entries.listId', 'entries.creationDate', 'entries.referencingURL', 'entries.linkTitle', 'entries.description', 'entries.imgURL', 'lists.displayName', 'lists.creationDate', 'lists.backColor', 'lists.txtColor', 'lists.fontSelection').orderBy('entries.entryId', 'asc');
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

    getSingleEntry(entryId){
        return knex('entries').where({ entryId })
    },

    updateDescription(entryId, description){
        return knex('entries').where({ entryId }).update({ description })
    },

    updateEntry(entryId, referencingURL, description, linkTitle, imgURL ){
        return knex('entries').where({ entryId }).update({
              referencingURL:referencingURL,
              description:description,
              linkTitle:linkTitle,
              imgURL: imgURL 
            })
    },

    deleteEntry(entryId){
        return knex('entries').where({ entryId }).del()
    },

    deleteList(listId){
        return knex('lists').where({ listId }).del()
    },

    logAClick(stat){
        return knex('stats').insert(stat)
    },

    logPageView(view){
        return knex('pageViews').insert(view)
    },

    statsRecordsCount(){
        return knex('stats').count('statId as statId')
    },

    statsForEntry(entryId){
        return knex('stats').where({ entryId })
    },

    statsForList(listId){
        return knex('pageViews').where({ listId })
    },

    statsRecords(){
        return knex('stats')
    },

    getListId(userId){
        return knex('lists').where({ userId }).select('userId', 'listId', 'customURL').orderBy('listId','asc')
    },
    
    incrementListViews(listId, listViews){
        return knex('lists').where('listId', listId).update({'listViews': listViews})
    },

    listViewsGet(listId){
        return knex('lists').where('listId', listId).select('listViews')
    },

    pageViewsGet(listId){
        return knex('pageViews').where('listId', listId)
    },

    countryCounts(listId){
        return knex('pageViews').where('listId', listId).distinct('countryOfOrigin').count().groupBy('countryOfOrigin')
    },

    provinceCounts(listId){
        return knex('pageViews').where('listId', listId).distinct('province').count().groupBy('province')
    },

    deviceTypes(listId){
        return knex('pageViews').where('listId', listId).distinct('deviceType').count().groupBy('deviceType')
    },

    browserNamesCounts(listId){
        return knex('pageViews').where('listId', listId).distinct('browserName').count().groupBy('browserName')
    },

    checkRecentlyAttempted(email){
        return knex('pwReset').where('email', email)
    },

    insertPWReset(reset){
        return knex('pwReset').insert(reset)
    },

    updatePassword(email, password){
        return knex('users').where('email', email).update({
            password:password
        })
    },

    deleteFromResetDb(pwResetId){
        return knex('pwReset').where({ pwResetId }).del()
    },

    incrementResetCodeAttempts(email, codeAttempts){
        return knex('pwReset').where('email', email).update({'codeAttempts': codeAttempts})
    },

    incrementResetSendAttempts(email, sendAttempts){
        return knex('pwReset').where('email', email).update({'sendAttempts': sendAttempts})
    },

    lockoutAccount(email){
        return knex('users').where('email', email).update({lockedOut:true})
    },

    putNewCode(email, resetCode, expirationGetTime){
        return knex('pwReset').where('email',email).update({'resetCode':resetCode, 'expirationGetTime':expirationGetTime})
    },

    putBackground(listId, backColor){
        return knex('lists').where('listId', listId).update({'backColor':backColor})
    },

    putFont(listId, fontSelection){
        return knex('lists').where('listId', listId).update({'fontSelection':fontSelection})
    },

    putTColor(listId, txtColor){
        return knex('lists').where('listId', listId).update({'txtColor':txtColor})
    },

    setDisplayName(listId, displayName){
        return knex('lists').where('listId', listId).update({'displayName':displayName})
    },

    customByListId(listId){
        return knex('lists').where('listId', listId)
    },

    changeProfilePicture(userId, profilePictureURL){
        return knex('users').where('userId', userId).update({'profilePictureURL':profilePictureURL})
    },

}