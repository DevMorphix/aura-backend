require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Appoinments } = require('../models/appoinment')
const { UserDetails } = require('../models/users')

const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');



router.post('/request', isAuthenticated, async (req, res) => {
    try {
        const { doctor_user="Hello", appointment_time } = req.body;
        const current_user = req.user["email"];
        const user = await UserDetails.findOne({ email: current_user });
        const doctor = await UserDetails.findOne({ email: doctor_user });
        const appoinment = await Appoinments.findOne({ user: current_user});
        if (appoinment===null){
            const newAppoinment = new Appoinments({
                user_name: user.full_name,
                doctor_name: doctor_user, // doctor.full_name
                appointment_time: appointment_time,
                user: current_user,
                appointment_status: "requested",    verified:{
                    type:Boolean,
                    default: false
                },
            });
            await newAppoinment.save()
            return res.status(200).json({ message: "Appoinment Booked" });
        }
        else {
            return res.status(403).json({ message: "User already booked a appoinment" });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });

    }
});


module.exports = router;