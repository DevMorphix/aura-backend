require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Appoinments } = require('../models/appoinment')
const { UserDetails } = require('../models/users')

const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');



router.post('/request', isAuthenticated, async (req, res) => {
    try {
        const current_user = req.user["email"];
        const user = await UserDetails.findOne({email})
        const appoinment = await Appoinments.findOne({ user: current_user, appointment_status: "request" })

        if (!appoinment) {
            return res.status(403).json({ message: "User already booked a appoinment" });
        }
        else {
            const newAppoinment = new Appoinments({
                user_name:user_name,
                doctor_name:doctor_name,
                appointment_time:appointment_time,
                user:current_user,
                appointment_status:"requested",
            });
            await newAppoinment.save()
            return res.status(200).json({ message: "Appoinment Booked" });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });

    }
});


module.exports = router;