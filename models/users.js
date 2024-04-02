const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserDetailSchema = new Schema({
    conceive:{
        type:Boolean,
        default:false
    },
    duration_period:{
        type:Number,
        required:true
    },
    last_cycle_regular:{
        type:String,
        required:false
    },
    last_cycle_irregular_start:{
        type:String,
        required:false
    },
    last_cycle_irregular_last:{
        type:String,
        required:false
    },
    last_period_start:{
        type: String,
        required:false
    },
    email:{
        type:String,
        required: true
    },
    verified:{
        type:Boolean,
        default: false
    },
    date:{  // Date of user registration  
        type:Date,
        default:Date.now 
    },
})

const UserOtpSchema = new Schema({
    otp:{
        type:String,
        required: true
    },
    user:{
        type:String,
        required: true
    },
    verified:{
        type:Boolean,
        default: false
    },
    date:{
        type:Date,
        default:Date.now 
    },
})

const User = new Schema({
    email:{
        type:String,
        required: true
    },
    verified:{
        type:Boolean,
        default: false
    },
    password:{
        type:String,
        required: true
    },
})

const Users = mongoose.model('User',User);
const UserDetails = mongoose.model('UserDetails',UserDetailSchema);
const UserOtp = mongoose.model('UserOtp',UserOtpSchema);
module.exports = { Users, UserOtp,UserDetails };