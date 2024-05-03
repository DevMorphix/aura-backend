const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotesSchema = new Schema({
    content:{
        type:String,
        default:true
    },
    user:{
        type:String,
        default:true
    }
})

const Notes = mongoose.model('Notes',NotesSchema);

module.exports = { Notes };