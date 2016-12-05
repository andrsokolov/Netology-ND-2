const express = require("express");
const bodyParser = require("body-parser");

var User = require('./userfactory').User;
var Task = require('./taskfactory').Task;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended": true}));

const routes = express.Router();

function httpError(res, message, code) {
	res.status(code || 500).json({"error": message});
    //process.exit(0);
}


routes.get("/users/", (req, res) => {

    User.list((err, users) => {
        res.json(users);
    });

});


routes.post("/users/", (req, res) => {

    let name = req.body.name;

    if(!name)
        return httpError(res, "name required", 400);

    User.findOne({name: name}, (err, user) => {
        if(user)
            return httpError(res, "user name exists", 400);

        User.maxId((err, currentId) => {

            var newUser = new User({
			    name: name,
                _id: currentId + 1
            });

            newUser.save((err, user) => {
                User.list((err, users) => {
                    res.json(users);
                })
            }); 

        });               
    });
});


routes.put("/users/:id", function(req, res) {
    let id = parseInt(req.params.id),
        name = req.body.name;

    if(!name)
        return httpError(res, "name required", 400);

    if(isNaN(id) || id <= 0)
        return httpError(res, "id required", 400);


    User.findOne({_id: id}, (err, user) => {
        if(!user)
            return httpError(res, "user not found", 400);

        user.name = name;
        
        user.save((err, user) => {
            User.list((err, users) => {
                res.json(users);
            })
        });               
    });
});


routes.delete("/users/:id", function(req, res) {
    let id = parseInt(req.params.id);
    
    if(isNaN(id) || id <= 0)
        return httpError(res, "id required", 400);

    User.findOne({_id: id}, (err, user) => {
        if(!user)
            return httpError(res, "user not found", 400);
        
        user.remove((err, user) => {
            User.list((err, users) => {
                res.json(users);
            })
        });               
    });
});


routes.get("/users/stat", (req, res) => {

    User.aggregate([{$match: {}},
        { 
            $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "owner",
            as: "tasks"
        }}, {
            $unwind: "$tasks"
        }, {
            $project: {
                _id: 1,
                name:1,
                taskClosed: {'$cond' : [ "$tasks.closed", 1, 0 ] }                
            }
        }, {
            $group: {
                _id: {
                    _id: '$_id',
                    name: '$name',
                },
                'closedTasks': {'$sum': '$taskClosed'}
            }
        }, {
            $project: {
                _id: '$_id._id',
                name: '$_id.name',
                closedTasks: 1               
            }
        }, {
            $sort: { closedTasks: -1 }
        }        
        
        ], (err, users) => {
        res.json(users);
    });

});


routes.get("/tasks/", (req, res) => {

    Task.list((err, tasks) => {
        res.json(tasks);
    });

});


routes.post("/tasks/", (req, res) => {

    let title = req.body.title;    

    if(!title)
        return httpError(res, "title required", 400);

    let closed = parseInt(req.body.closed) == 1;

    var newTask = new Task({
        title: title,
        closed: closed
    });

    let owner = parseInt(req.body.owner);

    if(!isNaN(owner) && owner) {
        User.findOne({_id: owner}, (err, user) => {
            if(!user)
                return httpError(res, "user not found", 400);

            newTask.owner = owner;

            newTask.save((err, item) => {
                Task.list((err, items) => {
                    res.json(items);
                })
            }); 
        });
    }
    else 
        newTask.save((err, item) => {
            Task.list((err, items) => {
                res.json(items);
            })
        }); 
});


routes.post("/tasks/search", (req, res) => {

    let query = {};

    if(req.body.title) query.title = { $regex: `.*${req.body.title}.*`};
    
    let closed = parseInt(req.body.closed);
    if(!isNaN(closed) && closed >=0 && closed <= 1) query.closed = closed == 1;

    Task.aggregate([{$match: query},
        { $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
        }}], (err, tasks) => {
        res.json(tasks);
    });

});



routes.put("/tasks/:id", function(req, res) {
    let id = req.params.id,
        title = req.body.title,
        closed = parseInt(req.body.closed),
        owner = parseInt(req.body.owner);

    Task.findOne({_id: id}, (err, task) => {
        if(!task)
            return httpError(res, "task not found", 400);

        if(typeof title != 'undefined')
            task.title = title;

        if(!isNaN(closed) && closed >=0 && closed <= 1)
            task.closed = closed == 1;

        if(isNaN(owner)) {            
            task.save((err, item) => {
                Task.list((err, items) => {
                    res.json(items);
                })
            });
        }
        else if(owner === 0) {
            task.owner = null;
            
            task.save((err, item) => {
                Task.list((err, items) => {
                    res.json(items);
                })
            });
        }
        else {
            User.findOne({_id: owner}, (err, user) => {
                if(!user)
                    return httpError(res, "user not found", 400);

                task.owner = owner;

                task.save((err, item) => {
                    Task.list((err, items) => {
                        res.json(items);
                    })
                }); 
            });
        }            
    });
});


routes.delete("/tasks/:id", function(req, res) {
    let id = parseInt(req.params.id);
  
    Task.findOne({_id: id}, (err, task) => {
        if(!task)
            return httpError(res, "task not found", 400);
        
        task.remove((err, task) => {
            Task.list((err, tasks) => {
                res.json(tasks);
            })
        });               
    });
});


app.use("/", routes);

app.use(function(req, res, next){
    httpError(res, 'Page not found', 404);
});

var server = app.listen(process.env.PORT || 8081, function() {
	var port = server.address().port;
	
	console.log("Server starts at ", port);
});
