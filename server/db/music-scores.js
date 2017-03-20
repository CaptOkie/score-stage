const mongo = require('./mongo');

function convertFrom(doc) {
    doc = mongo.setId(doc);
    if (doc && doc.owner) {
        doc.owner = doc.owner.toHexString();
    }
    return doc;
}

module.exports.create = function(score) {

    return mongo('musicScores').then(db => {
        // TODO Maybe should deep copy?
        const doc = {
            owner : mongo.getId(score.owner),
            title : score.title,
            measures : score.measures,
            groups : score.groups
        };

        return db.musicScores.insertOne(doc).then(result => {
            doc._id = result.insertedId;
            return convertFrom(doc);
        });
    });
};

module.exports.get = function(id) {

    return mongo('musicScores').then(db => {
        return db.musicScores.findOne({ _id : mongo.getId(id) }).then(convertFrom);
    });
};

module.exports.ownedBy = function(id) {

    return mongo('musicScores').then(db => {
        return db.musicScores.find({ owner : mongo.getId(id) }).sort({ title : 1 }).collation(mongo.collation())
            .toArray().then(docs => docs.map(convertFrom));
    });
};