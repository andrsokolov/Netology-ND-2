const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const users = require('./users');


const app = express();

const restAPI = express.Router();
const rpcAPI = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended": true}));

app.use( methodOverride('_method', {methods: ['GET']} ));


function handleError(res, message, code) {
	res.status(code || 500).json({"error": message});
}

function handleErrorRpc(res, id, message, code) {
	res.json({
		"jsonrpc": "2.0",
		"error": {
			"code": code,
			"message": message
		},
		"id": id
	});
}

var usersInit = [
		{name: 'Вася', score: 2},
		{name: 'Коля', score: 1},
		{name: 'Миша', score: 3},
		{name: 'Ира',  score: 12},
		{name: 'Катя', score: 11},
		{name: 'Лена', score: 13}
	];

var storage = new users.Users(usersInit);


//выводим всех, с учетом limit, offset, fields
function getUsers(limit, offset, fields) {
	limit = parseInt(limit || storage.length);
	offset = parseInt(offset || 0);
	fields = fields || '';
	
	limit = isNaN(limit) ? storage.length : Math.abs(limit);
	offset = isNaN(offset) ? 0 : Math.abs(offset);
			
	let result = new users.Users(storage.slice(offset, offset + limit));
	
	if(fields) {
		
		fields = fields.split(',');
		
		result.forEach(function(obj){ 
			for(var prop in obj)
				if(fields.indexOf(prop) === -1)
					delete obj[prop];
		});
	}
	
	return result;
}

//добавляем
function postUser(name, score) {
	score = parseInt(score);
	
	if(isNaN(score) || !name)
		return {
			error: {
				message: "Must provide user name:string and score:int.",
				code: 400
			}
		};	
	
	return storage.add(name, score);
}

//выводим по id
function getUser(id) {
	id = parseInt(id)
	
	if(isNaN(id))
		return {
			error: {
				message: "Must provide user id:int.",
				code: 400
			}
		};	
		
	let usr = storage.findById(id);
		
	if(!usr)
		return {
			error: {
				message: "User not found.",
				code: 500
			}
		};
		
	return usr;
}

//обновляем по id
function putUser(id, name, score) {
	
	id = parseInt(id);
	score = parseInt(score);
	
	if(isNaN(id) || isNaN(score) || !name)
		return {
			error: {
				message: "Must provide user id:int, user name:string and score:int.",
				code: 400
			}
		};
		
	let usr = storage.findById(id);
		
	if(!usr)
		return {
			error: {
				message: "User not found.",
				code: 500
			}
		};
		
		
	usr.name = name;
	usr.score = score;		
		
	return usr;
}

//удаляем всех
function deleteUsers() {
	storage.clear();
		
	return {};
}

//удаляем по id
function deleteUser(id) {
	
	id = parseInt(id);
	
	if(isNaN(id))
		return {
			error: {
				message: "Must provide user id:int.",
				code: 400
			}
		};
		
	if(!storage.deleteById(id)) 
		return {
			error: {
				message: "User not found.",
				code: 500
			}
		};
				
	return {};
}









restAPI.get("/users/", function(req, res) {
	let result = getUsers(req.query["limit"], req.query["offset"], req.query["fields"]);
	
	if(result["error"]) {
		handleError(res, result["error"].message, result["error"].code);
		return;
	}
	
	res.json(
		{ data: result, count: result.length, countAll: storage.length }
	);
});


restAPI.post("/users/", function(req, res) {
	
	let result = postUser(req.body.name, req.body.score);	
		
	if(result["error"]) {
		handleError(res, result["error"].message, result["error"].code);
		return;
	}
		
	res.json(
		{ data: result }
	);
});

restAPI.get("/users/:id", function(req, res) {
	
	let result = getUser(req.params.id);	
		
	if(result["error"]) {
		handleError(res, result["error"].message, result["error"].code);
		return;
	}
		
	res.json(
		{ data: result }
	);
	
});

restAPI.put("/users/:id", function(req, res) {
	
	let result = putUser(req.params.id, req.body.name, req.body.score);
	
	if(result["error"]) {
		handleError(res, result["error"].message, result["error"].code);
		return;
	}
		
	res.json(
		{ data: result }
	);
	
});

restAPI.delete("/users/", function(req, res) {	
	let result = deleteUsers();
	
	if(result["error"]) {
		handleError(res, result["error"].message, result["error"].code);
		return;
	}
	
	res.status(204).end();
});

restAPI.delete("/users/:id", function(req, res) {
	
	let result = deleteUser(req.params.id);
	
	if(result["error"]) {
		handleError(res, result["error"].message, result["error"].code);
		return;
	}
	
	res.status(204).end();
});






const RPC = {
	getUsers: function(params, callback) {
		let result = getUsers(params["limit"], params["offset"], params["fields"]);
	
		callback ( result["error"], { data: result, count: result.length, countAll: storage.length } );
	},
	postUser: function(params, callback) {
		let result = postUser(params["name"], params["score"]);	
		
		callback ( result["error"], { data: result } );
	},
	getUser: function(params, callback) {
		let result = getUser(params["id"]);	
		
		callback ( result["error"], { data: result } );
	},
	putUser: function(params, callback) {
		let result = putUser(params["id"], params["name"], params["score"]);	
		
		callback ( result["error"], { data: result } );
	},
	deleteUsers: function(params, callback) {
		let result = deleteUsers();	
		
		callback ( result["error"], { data: result } );
	},
	deleteUser: function(params, callback) {
		let result = deleteUser(params["id"]);	
		
		callback ( result["error"], { data: result } );
	}
};


rpcAPI.post("/", function(req, res) {
	
	if(!RPC[req.body.method]) {
		handleErrorRpc(res, req.body.id, "Procedure not found.", "100");
		return;	
	}
	
	if(req.body.id) {
		handleErrorRpc(res, null, "id not defined.", "102");
		return;	
	}
	
	const method = RPC[req.body.method];
	
	method(req.body.params, function(error, result) {
		
		if(error) {
			handleErrorRpc(res, req.body.id, error.message, error.code);
			return;	
		}
		
		res.json({"jsonrpc": "2.0", "result": result, "id": req.body.id});
	});
});




app.use("/rest/", restAPI);
app.use("/rpc/", rpcAPI);


app.use(function(req, res, next){
    handleError(res, 'Page not found', 404);
});


var server = app.listen(process.env.PORT || 8081, function() {
	var port = server.address().port;
	
	console.log("App now running on port", port);
});