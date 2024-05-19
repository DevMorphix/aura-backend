require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Appoinments } = require('../models/appoinment')
const { UserDetails } = require('../models/users')

const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');
const isAdmin = require('../middlware/admin');
const isUserValidate = require('../middlware/user');



// isAdmin middleware need to add after
router.post('/permissionToggle', isAuthenticated,isUserValidate, async (req, res) => {
    try {
        const current_user = req.user["email"]
        const user_email = req.body.email
        const user = await UserDetails.findOne({ email:user_email })
        if (user.doctor){
            user.doctor = false
            await user.save()
            return res.status(200).json({ message: "User Permission disabled doctor" });
        }else{
            user.doctor = true
            await user.save()
            return res.status(200).json({ message: "User Permission enabled doctor" });
        }
    } catch (err) {
        console.log(err);

    }
});

router.get('/all-users',  isAuthenticated,isUserValidate,async (req, res) => {
    try {
        const user = await UserDetails.find({}).select('email full_name doctor -_id')
        return res.status(200).json({ message: "Listing all users" ,all_users:user });
    } catch (err) {
        console.log(err);

    }
});

// isAuthenticated,isUserValidate,
router.get('/graph',  async (req, res) => {
    try {
        const user = await UserDetails.find({}).select('-_id -__v')
        console.log(user[0].dob);
        // for 
        return res.status(200).json({ message: "Listing all users"  });
    } catch (err) {
        console.log(err);

    }
});


module.exports = router;