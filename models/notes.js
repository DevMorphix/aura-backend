const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotesSchema = new Schema({
    content:{
        type:String,
        required:false
    },
    user:{
        type:String,
        required:true
    }
})

const Notes = mongoose.model('Notes',NotesSchema);

module.exports = { Notes };