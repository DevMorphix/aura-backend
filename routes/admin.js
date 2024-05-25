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
router.post('/permissionToggle', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        // const current_user = req.user["email"]
        const user_email = req.body.user_email
        const user = await UserDetails.findOne({ email: user_email })
        if (user.doctor) {
            user.doctor = false
            await user.save()
            return res.status(200).json({ message: "User Permission disabled doctor" });
        } else {
            user.doctor = true
            await user.save()
            return res.status(200).json({ message: "User Permission enabled doctor" });
        }
    } catch (err) {
        console.log(err);

    }
});

router.get('/all-users', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        const user = await UserDetails.find({}).select('email full_name doctor -_id')
        return res.status(200).json({ message: "Listing all users", all_users: user });
    } catch (err) {
        console.log(err);

    }
});


router.get('/graph', isAuthenticated, isUserValidate, isAdmin, async (req, res) => {
    try {
        const user = await UserDetails.find({}).select('-_id -__v')
        const age_year = new Set([]);
        const year_with_count = []
        for (let step = 0; step < user.length; step++) {
            const slicedData = user[step].dob.slice(0, 4);
            age_year.add(slicedData, "count");
        }
        age_year.forEach(async (year) => {
            const user = await UserDetails.find({ dob_year: year }).select('-_id -__v')
            year_with_count.push({ year: year, count: user.length })
        });
        return res.status(200).json({ message: "Graph data", data: year_with_count });
    } catch (err) {
        console.log(err);

    }
});


module.exports = router;