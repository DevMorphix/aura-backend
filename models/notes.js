const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotesSchema = new Schema({
    note_id:{
        type:String,
        required:false
    },
    title:{
        type:String,
        required:false
    },
    content:{
        type:String,
        required:false
    },
    user:{
        type:String,
        required:true
    },
    created_at: {
        type: Date,
        required: false,
        default: Date.now
    },
    updated_at: {
        type: Date,
        required: false,
        default: Date.now
    }
})

const Notes = mongoose.model('Notes',NotesSchema);

module.exports = { Notes };