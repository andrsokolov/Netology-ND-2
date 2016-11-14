const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const mongoUrl = 'mongodb://127.0.0.1:27017/hw10';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended": true}));

const routes = express.Router();

function dbError(err) {
    console.log('Ошибка БД: ', err);
    return false;
}

function httpError(res, message, code) {
	res.status(code || 500).json({"error": message});
}



routes.get("/", function(req, res) {

    let search = req.query["search"];

    
    mongoClient.connect(mongoUrl, (err, db) => {
        if(err)
            return dbError(err);

        let query = search ? { $or : [{ name: { $regex: `.*${search}.*`} }, { phone: { $regex: `.*${search}.*`} }] } : {};

        //console.log(JSON.stringify(query));

        db.collection('users').find(query, {name:1, phone:1, _id:0}).sort({name:1, phone:1}).toArray((err, users) => {

            if(err)
                return dbError(err);

            db.close();

            res.json(
                { data: users, count: users.length }
            );

        });
    });
});


routes.post("/", function(req, res) {
    let name = req.body.name,
        phone = req.body.phone;

    if(!name)
        return httpError(res, "Необходимо указать ФИО (name:string).", 400);

    mongoClient.connect(mongoUrl, (err, db) => {
        if(err)
            return dbError(err);


        db.collection('users').find({name: name}, {_id:1}).toArray((err, users) => {

            if(err)
                return dbError(err);

            if(users.length) {
                db.close();
                return httpError(res, `Человек с ФИО [${name}] уже существует!`, 400);
            }

            db.collection('users').insert({name: name, phone: phone}, (err, result) => {

                if(err)
                    return dbError(err);

                db.close();

                res.json(
                    { message: 'Человек добавлен' }
                );

            });
        });        
    });
});



routes.put("/:name", function(req, res) {
    let name = req.params.name,
        phone = req.body.phone;

    mongoClient.connect(mongoUrl, (err, db) => {
        if(err)
            return dbError(err);

        db.collection('users').find({name: name}, {_id:1}).toArray((err, users) => {

            if(err)
                return dbError(err);

            if(!users.length) {
                db.close();
                return httpError(res, `Человек с ФИО [${name}] не найден!`, 400);
            }

            db.collection('users').update({name: name}, {$set : {phone: phone}}, (err, result) => {

                if(err)
                    return dbError(err);

                db.close();

                res.json(
                    { message: 'Человек обновлен' }
                );

            });
        });
    });
});


routes.delete("/:name", function(req, res) {
    let name = req.params.name;

    mongoClient.connect(mongoUrl, (err, db) => {
        if(err)
            return dbError(err);

        db.collection('users').find({name: name}, {_id:1}).toArray((err, users) => {

            if(err)
                return dbError(err);

            if(!users.length) {
                db.close();
                return httpError(res, `Человек с ФИО [${name}] не найден!`, 400);
            }

            db.collection('users').remove({name: name}, (err, result) => {

                if(err)
                    return dbError(err);

                db.close();

                res.json(
                    { message: 'Человек удален' }
                );

            });
        });
    });
});





app.use("/", routes);

app.use(function(req, res, next){
    httpError(res, 'Страница не найдена', 404);
});

var server = app.listen(process.env.PORT || 8081, function() {
	var port = server.address().port;
	
	console.log("Сервер запущен на порту ", port);
});