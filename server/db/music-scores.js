const Mongo = require('./mongo');

function convertFrom(doc) {
    doc = Mongo.setId(doc);
    if (doc && doc.owner) {
        doc.owner = doc.owner.toHexString();
    }
    return doc;
}

module.exports = function(mongo) {
    this.mongo = mongo || new Mongo();
};

module.exports.prototype.create = function(score) {
    return this.mongo.req('musicScores').then(db => {
        const doc = {
            owner : Mongo.getId(score.owner),
            title : score.title,
            measures : score.measures,
            groups : score.groups
        };

        return db.musicScores.insertOne(doc).then(result => {
            return convertFrom(result.ops[0]);
        });
    });
};

module.exports.prototype.get = function(id) {
    return this.mongo.req('musicScores').then(db => {
        return db.musicScores.findOne({ _id : Mongo.getId(id) }).then(convertFrom);
    });
};

module.exports.prototype.getAllOwnedBy = function(id) {
    return this.mongo.req('musicScores').then(db => {
        return db.musicScores.find({ owner : Mongo.getId(id) }).sort({ title : 1 }).collation(Mongo.collation())
            .project({ measures : 0 }).map(convertFrom).toArray();
    });
};

module.exports.prototype.delete = function(id, owner) {
    return this.mongo.req('musicScores').then(db => {
        const filter = {
            _id : Mongo.getId(id),
            owner : Mongo.getId(owner)
        };
        return db.musicScores.deleteOne(filter).then(result => result.deletedCount);
    });
};
