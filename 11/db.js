var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){

});
mongoose.connect('mongodb://127.0.0.1:27017/hw11', {}, err => {
    if(err) {
        console.log('Mongoose connection error');
        process.exit(0);
    }
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected');
        process.exit(0);
    });
});

exports.db = mongoose;