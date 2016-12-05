var mongoose = require('./db').db;
var Task = require('./taskfactory').Task;

var schema = mongoose.Schema({
    _id: {
        type: Number,
        default: 0
    },
    name: String
},
{ timestamps: true });

schema.statics.maxId = function(cb) {

    return this.findOne().sort('-_id').exec(function(err, item) {
        if(cb) cb(err, item ? item._id : 0);
    }); 
}


schema.statics.list = function(cb) {
    return this.find({}, cb);    
}


schema.pre('remove', function(next){
    
    Task.find({owner: this._id}, (err, items) => {
        items.forEach (
            task => {
                task.remove((err, task) => {
                    if (err) return handleError(err);
                });
            }
        );

    });
    
    next();
});


module.exports = {
    User: mongoose.model("User", schema),
    schema: schema
} 