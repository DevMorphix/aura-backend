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
    period_month:{
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

const PeriodsMonthlySchema = new Schema({
    period_dates:{
        type: Array,
        required: false,
    },
    period_month:{
        type: String,
        required: false,
    },
    period_year:{
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
const PeriodsMonthly = mongoose.model('PeriodsMonthly',PeriodsMonthlySchema);


module.exports = { PeriodsDates,PeriodsMonthly };