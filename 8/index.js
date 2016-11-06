const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.use(express.static(__dirname + '/public'));


io.on('connection', function (socket) {

    let userAdded = false;

    socket.on('add user', function (data) {
        
        if(userAdded) return;

        //console.log('add user');

        socket.join(data.room);
        socket.username = data.name;
        socket.room = data.room;

        userAdded = true;

        let numUsers = io.sockets.adapter.rooms[data.room].length;

        socket.emit('login', {
            numUsers: numUsers
        });

        socket.broadcast.to(data.room).emit('user joined', {
            name: socket.username,
            numUsers: numUsers
        });
    });


    socket.on('new message', function (data) {
        
        //console.log('new message');

        socket.broadcast.to(socket.room).emit('new message', {
            name: socket.username,
            message: data.message
        });
    });

    socket.on('disconnect', function () {

        if(!userAdded) return;

        //console.log('disconnect');

        let numUsers = io.sockets.adapter.rooms[socket.room].length;

        socket.broadcast.to(socket.room).emit('user left', {
            name: socket.username,
            numUsers: numUsers
        });
    });

});


server.listen(process.env.PORT || 8081, function () {
    console.log('Server listening at port %d', server.address().port);
});