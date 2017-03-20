use ScoreStage
db.users.createIndex({ username : 1 }, { unique: true, collation : { locale : 'en', strength : 2 } });
db.musicScores.createIndex({ owner : 1, title : 1 }, { collation : { locale : 'en', strength : 2 } });