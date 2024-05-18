require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Appoinments } = require('../models/appoinment')
const { Users,UserDetails } = require('../models/users')
const { PeriodsDates } = require('../models/user_analatics')


const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');
const isUserValidate = require('../middlware/user');

router.post('/period-start',isAuthenticated,isUserValidate,async (req,res) =>{
    try{
        const current_user = req.user["email"]
        const { start_date } = req.body;
        const newPeriods = new PeriodsDates({
            user:current_user,
            periods_start:start_date,
            periods_end:start_date
        })
        await newPeriods.save()
        return res.status(200).json({ message: "Periods Start date updated"})
    }catch(error){
        console.log(error);
        return res.status(400).json({ message: err.message });
    }
});

router.post('/period-end',isAuthenticated,isUserValidate,async (req,res) =>{
    try{
        const current_user = req.user["email"]
        const { end_date } = req.body;
        const periods = await PeriodsDates.findOne({user:current_user})
        periods.periods_end = end_date
        await periods.save()
        return res.status(200).json({ message: "Periods End date updated"})
    }catch(error){
        console.log(error);
        return res.status(400).json({ message: err.message });
    }
});


module.exports = router;