require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Appoinments } = require('../models/appoinment')
const { UserDetails } = require('../models/users')

const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');
const isAdmin = require('../middlware/admin');
const isUserValidate = require('../middlware/user');




router.post('/permissionToggle', isAuthenticated,isAdmin,isUserValidate, async (req, res) => {
    try {
        
        return res.status(200).json({ message: "permission" });
    } catch (err) {
        console.log(err);

    }
});


module.exports = router;