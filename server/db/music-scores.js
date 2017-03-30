const Mongo = require('./mongo');

function convertScore(score) {
    if (score) {
        score = Mongo.setId(score);
        score.owner = Mongo.toHexString(score.owner);
    }
    return score;
}

function convertMeasure(measure) {
    if (measure) {
        delete measure.rev;
        delete measure.owner;
        delete measure._id;
        delete measure.score;
    }
    return measure;
}

module.exports = function(mongo) {
    this.mongo = mongo || new Mongo();
};

module.exports.prototype.create = function(score) {
    return this.mongo.req('musicScores', 'measures').then(db => {

        const id = Mongo.newId();
        const rev = Mongo.newId();
        const owner = Mongo.getId(score.owner);

        const measures = score.measures.map(measure => {
            return {
                owner : owner,
                score : id,
                id : measure.id,
                rev : [ rev ],
                timeSig : measure.timeSig,
                bars : measure.bars,
                prev : measure.prev,
                next : measure.next
            };
        });

        const doc = {
            _id : id,
            owner : owner,
            title : score.title,
            groups : score.groups,
            rev : rev
        };

        return db.measures.insertMany(measures).then(r1 => {
            return db.musicScores.insertOne(doc).then(r2 => id);
        });
    });
};

module.exports.prototype.search = function(query) {
    return this.mongo.req('musicScores').then(db => {
        return db.musicScores.find({ $text : { $search : query } }).map(convertScore).toArray();
    });
};

module.exports.prototype.get = function(id) {
    return this.mongo.req('musicScores', 'measures').then(db => {
        id = Mongo.getId(id);
        function getScore(ret) {
            return db.musicScores.findOne({ _id : id }).then(score => {
                if (score) {
                    if (!ret || !score.rev.equals(ret.rev)) {
                        return db.measures.find({ score : id, rev : score.rev }).map(convertMeasure)
                            .toArray().then(measures => {
                                score.measures = measures;
                                return getScore(score);
                            });
                    }
                    return convertScore(ret);
                }
                return false;
            });
        }
        return getScore(undefined);
    });
};

module.exports.prototype.getAllOwnedBy = function(id) {
    return this.mongo.req('musicScores').then(db => {
        return db.musicScores.find({ owner : Mongo.getId(id) }).sort({ title : 1 }).collation(Mongo.collation())
            .map(convertScore).toArray();
    });
};

module.exports.prototype.delete = function(id, owner) {
    return this.mongo.req('musicScores', 'measures').then(db => {
        id = Mongo.getId(id);
        owner = Mongo.getId(owner);
        var filter = { _id : id, owner : owner };
        return db.musicScores.deleteOne(filter).then(r1 => {
            if (r1.deletedCount > 0) {
                filter = { score : id, owner : owner };
                return db.measures.deleteMany(filter).then(r2 => true);
            }
            return false;
        });
    });
};

module.exports.prototype.getMeasures = function(id, rev, owner, mids) {
    return this.mongo.req('measures').then(db => {
        const filter = { score : Mongo.getId(id), rev : Mongo.getId(rev), owner : Mongo.getId(owner) };
        if (mids) {
            filter.id = { $in : mids };
        }
        return db.measures.find(filter).map(convertMeasure).toArray();
    });
};

module.exports.prototype.getMeasure = function(id, rev, owner, mid) {
    return this.getMeasures(id, rev, owner, [ mid ]).then(measures => measures.length > 0 ? measures[0] : false);
};

module.exports.prototype.getGroups = function(id, rev, owner) {
    return this.mongo.req('musicScores').then(db => {
        const filter = { _id : Mongo.getId(id), rev : Mongo.getId(rev), owner : Mongo.getId(owner) };
        return db.musicScores.findOne(filter).then(score => {
            score = convertScore(score);
            return score ? score.groups : [];
        });
    });
};

module.exports.prototype.updateScore = function(id, rev, owner, toAdd, toRemove, groups) {
    toAdd = toAdd || [];
    toRemove = toRemove || [];

    return this.mongo.req('musicScores', 'measures').then(db => {

        const newRev = Mongo.newId();
        id = Mongo.getId(id);
        rev = Mongo.getId(rev);
        owner = Mongo.getId(owner);

        toAdd = toAdd.map(measure => {
            return {
                owner : owner,
                score : id,
                id : measure.id,
                rev : [ newRev ],
                timeSig : measure.timeSig,
                bars : measure.bars,
                prev : measure.prev,
                next : measure.next
            };
        });
        const ids = toAdd.map(measure => measure.id).concat(toRemove);

        var operations = toAdd.map(measure => {
            return { insertOne : measure };
        });
        var filter = { score : id, rev : rev, owner : owner, id : { $nin : ids } };
        var update = { $push : { rev : newRev } };
        operations.push({ updateMany : { filter : filter, update : update } });

        return db.measures.bulkWrite(operations).then(r1 => {

            filter = { _id : id, owner : owner, rev : rev };
            update = { $set : { rev : newRev } };
            if (groups) {
                update.$set.groups = groups;
            }
            return db.musicScores.updateOne(filter, update).then(r2 => {

                operations = [];
                // Remove old rev if success, remove newRev if failed
                const success = r2.modifiedCount > 0
                const revToClear = success ? rev : newRev;
                
                filter = { score : id, owner : owner, rev : revToClear, id : { $in : ids } };
                operations.push({ deleteMany : { filter : filter } });
                
                filter = { score : id, owner : owner };
                update = { $pull : { rev : revToClear } };
                operations.push({ updateMany : { filter : filter, update : update } });
                return db.measures.bulkWrite(operations).then(r3 => success && newRev);
            });
        });
    });
};
