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
        const user = await UserDetails.findOne({ email:current_user })
        if (user.doctor){
            user.doctor = false
            await user.save()
            return res.status(200).json({ message: "User Permission enabled doctor" });
        }else{
            user.doctor = true
            await user.save()
            return res.status(200).json({ message: "User Permission disabled doctor" });
        }
    } catch (err) {
        console.log(err);

    }
});


module.exports = router;