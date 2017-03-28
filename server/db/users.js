const Mongo = require('./mongo');

module.exports = function(mongo) {
    this.mongo = mongo || new Mongo();
};

module.exports.prototype.get = function(id) {
    return this.mongo.req('users').then(db => {
        return db.users.findOne({ _id : Mongo.getId(id) }, { fields : { password : 0 } }).then(Mongo.setId);
    });    
};

module.exports.prototype.getCredentials = function(username) {
    return this.mongo.req('users').then(db => {
        const options = {
            fields : { username : 1, password : 1 },
            collation : Mongo.collation()
        };
        return db.users.findOne({ username : username }, options).then(Mongo.setId);
    });    
};

module.exports.prototype.create = function(user) {
    return this.mongo.req('users').then(db => {
        return db.users.insertOne(user).then(result => {
            return result.insertedCount ? Mongo.toHexString(result.insertedId) : false;
        }, error => {
            if (error.code === 11000) {
                return false;
            }
            return Promise.reject(error);
        });
    });
};