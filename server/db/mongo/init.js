use ScoreStage
db.users.createIndex({ username : 1 }, { unique: true, collation : { locale : 'en', strength : 2 } });
db.musicScores.createIndex({ owner : 1, title : 1 }, { collation : { locale : 'en', strength : 2 } });
db.musicScores.createIndex({ title : 'text' });
db.measures.createIndex({ id : 1, rev : 1 }, { unique : true });
db.measures.createIndex({ score : 1, rev : 1, owner : 1, id : 1 });