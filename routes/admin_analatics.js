require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Appoinments } = require('../models/appoinment')
const { Users,UserDetails } = require('../models/users')

const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');
const isUserValidate = require('../middlware/user');

// isAuthenticated,isUserValidate,
router.get('/userdata',  async (req, res) => {
    try {
        const total_verified_users = await Users.find({verified:true}).countDocuments({}); // count of verified users
        const total_normal_users = await UserDetails.find({doctor:false}).countDocuments({}); // count of normal users
        const total_doctors_users = await UserDetails.find({doctor:false}).countDocuments({}); // count of doctors users
        return res.status(200).json({ total_users_count:total_verified_users,normal_users_count:total_normal_users,doctors_users_count:total_doctors_users })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });

    }
});




module.exports = router;