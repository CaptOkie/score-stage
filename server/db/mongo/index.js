const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const URL = 'mongodb://localhost:27017/ScoreStage';
var database = undefined;

function init() {
    return MongoClient.connect(URL).then(db => database = db);
}

module.exports = function(db) {
    this.db = db || database;
};

module.exports.setId = function(doc) {
    if (doc) {
        doc.id = doc._id.toHexString();
        delete doc._id;
    }
    return doc;    
};

module.exports.getId = function(string) {
    if (string) {
        return ObjectID.createFromHexString(string);
    }
    return undefined;
};

module.exports.collation = function() {
    return { locale : 'en', strength : 2 };
};

module.exports.prototype.req = function() {
    const promise = this.db ? Promise.resolve(this.db) : MongoClient.connect(URL).then(db => this.db = database = db);
    const cols = Array.from(arguments);
    return promise.then(db => {
        return cols.reduce((collections, col) => {
            collections[col] = db.collection(col);
            return collections;
        }, {});
    });
};
