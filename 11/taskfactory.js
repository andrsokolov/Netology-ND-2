var mongoose = require('./db').db;

var schema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    closed: {
        type: Boolean,        
        default: false
    },
    owner: {
        type: Number,
        ref: 'User',
        default: null
    }
},
{ timestamps: true });


schema.statics.list = function(cb) {
    return this.find({}, cb).populate('owner');    
};

module.exports = {
    Task: mongoose.model("Task", schema),
    schema: schema
};