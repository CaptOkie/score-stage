const mongo = require('./mongo');

module.exports.get = function(id) {

    return mongo('users').then(db => {
        return db.users.findOne({ _id : mongo.getId(id) }, { fields : { password : 0 } }).then(mongo.setId);
    });
};

module.exports.getCredentials = function(username) {

    return mongo('users').then(db => {
        const options = {
            fields : { username : 1, password : 1 },
            collation : mongo.collation()
        };
        return db.users.findOne({ username : username }, options).then(mongo.setId);
    });
};