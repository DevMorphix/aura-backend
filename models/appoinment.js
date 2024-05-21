const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppoinmentSchema = new Schema({
    appointment_id:{
        type:String,
        required:true
    },
    user_name: {
        type: String,
        required: true
    },
    doctor_email: {
        type: String,
        required: true
    },
    doctor_name: {
        type: String,
        required: true
    },
    appointment_time: {
        type: String,
        required: true
    },
    user:{
        type: String,
        required: true
    },
    hospital_details:{
        type: String,
        required: false
    },
    reject_reason: {
        type: String,
        required: false
    },
    appointment_status: {
        type: String,
        required: true,
        enum: ["requested", "accepted", "rejected"]
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

const Appoinments = mongoose.model('Appoinments', AppoinmentSchema);

module.exports = { Appoinments };