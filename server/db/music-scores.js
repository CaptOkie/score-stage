const Mongo = require('./mongo');

function convertFrom(doc) {
    if (doc) {
        doc = Mongo.setId(doc);
        if (doc.owner) {
            doc.owner = doc.owner.toHexString();
        }
        if (doc.rev) {
            doc.rev = doc.rev.toHexString();
        }
        if (doc.measures) {
            doc.measures.forEach(measure => {
                measure = Mongo.setId(measure);
                measure.prev = measure.prev && measure.prev.toHexString();
                measure.next = measure.next && measure.next.toHexString();
            });
        }
    }
    return doc;
}

function createRev(oldId) {
    var newId = undefined;
    do {
        newId = Mongo.newId();
    } while (newId.equals(oldId));
    return newId;
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
            groups : score.groups,
            rev : createRev()
        };
        doc.measures.forEach(measure => {
            measure._id = Mongo.newId();
        });

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
        return db.musicScores.deleteOne(filter).then(result => result.deletedCount > 0);
    });
};

module.exports.prototype.getMeasure = function(id, index) {
    return this.mongo.req('musicScores').then(db => {
        const filter = { _id : Mongo.getId(id), 'measures.$._index' : index };
        const projection = { 'measures.$' : 1 };
        return db.musicScores.findOne(filter, { fields : projection }).then(doc => {
            doc = convertFrom(doc);
            return doc && doc.measures[0];
        });
    });
};

module.exports.prototype.addMeasure = function(id, owner, rev, index, measure) {
    return this.mongo.req('musicScores').then(db => {
        measure._index = index;
        // TODO Figure out mongo's bullshit or ditch mongo
        const newRev = createRev(rev);
        const filter = { _id : Mongo.getId(id), owner : Mongo.getId(owner), rev : Mongo.getId(rev) };
        const update = { $push : { measures : { $each : [ measure ], $position : index } }, $set : { rev : newRev } };
        return db.musicScores.updateOne(filter, update).then(result => result.modifiedCount > 0 ? newRev : undefined);
    });
};

module.exports.prototype.deleteMeasure = function(id, owner, rev, index) {
    return this.mongo.req('musicScores').then(db => {
        const newRev = createRev(rev);
        const filter = { _id : Mongo.getId(id), owner : Mongo.getId(owner), rev : Mongo.getId(rev) };
        const update = {  };
    });
};