const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PeriodsSchema = new Schema({
    periods_start:{
        type: String,
        required: false,
    },
    periods_end:{
        type: String,
        required: false,
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

const PeriodsDates = mongoose.model('PeriodsDates',PeriodsSchema);

module.exports = { PeriodsDates };