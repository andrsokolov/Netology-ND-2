const express = require("express");
var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.send("Hello Express.js");
});

app.get('/hello', function(req, res) {
    res.send("Hello stranger !");
});

app.get('/hello/:name', function(req, res) {
    res.send(`Hello, ${req.params.name} !`);
});

app.all('/sub/*', function(req, res) {
    res.send('You requested URI: ' + req.protocol + '://' + req.get('host') + req.originalUrl);
});

app.post('/post', function(req, res, next) {
    
    if(req.get('Key'))
        next();
    else
        res.sendStatus(401);

}, function(req, res) {
        
    if(Object.keys(req.body).length)
        res.json(req.body);
    else
        res.sendStatus(404);
});


var server = app.listen(process.env.PORT || 8081, function() {
	var port = server.address().port;
	
	console.log("App now running on port", port);
});

