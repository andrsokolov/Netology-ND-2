const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb://127.0.0.1:27017/hw9';


var pokemons = [
	{"name": "Test1", "level": 2},
	{"name": "Test2", "level": 1},
	{"name": "Test3", "level": 3},
	{"name": "Test4", "level": 12},
	{"name": "Test5", "level": 11},
	{"name": "Test6", "level": 13}
];

function dbError(err) {
    console.log('Db error: ', err);
    return false;
}

function initCollection(db, callback) {
    let tPokemons = db.collection('pokemons');

    tPokemons.insert(pokemons, (err, result) => {

        if(err)
            return dbError(err);

        callback(result);

    });
}


function findItemsWithQuery(db, query, callback) {
    let tPokemons = db.collection('pokemons');

    tPokemons.find(query).toArray((err, result) => {

        if(err)
            return dbError(err);

        callback(result);

    });
}

function removeItemsWithQuery(db, query, callback) {
    let tPokemons = db.collection('pokemons');

    tPokemons.remove(query, (err, result) => {

        if(err)
            return dbError(err);

        callback(result);

    });
}


mongoClient.connect(mongoUrl, (err, db) => {
    if(err)
        return dbError(err);

    initCollection(db, (result) => {
        findItemsWithQuery(db, {'level': 11}, (result) => {
            console.log("Records found:", result.length);
            console.log(result);

            removeItemsWithQuery(db, {'level': 11}, (result) => {
                console.log("Remove them");

                findItemsWithQuery(db, {}, (result) => {
                    console.log("All records:", result.length);
                    console.log(result);

                    removeItemsWithQuery(db, {}, (result) => {
                        console.log("Clear collection");

                                              
                        db.close();
                    });
                });
            });
        });
    });

});