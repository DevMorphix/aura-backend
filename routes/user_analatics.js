require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Appoinments } = require('../models/appoinment')
const { Users, UserDetails } = require('../models/users')
const { PeriodsDates, PeriodsMonthly } = require('../models/user_analatics')


const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');
const isUserValidate = require('../middlware/user');

router.post('/period-start', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        const current_user = req.user["email"]
        const { start_date } = req.body;
        if(!start_date){
            return res.status(400).json({ message: "Start Date have valid" });
        }
        const newPeriods = new PeriodsDates({
            user: current_user,
            periods_start: start_date,
            periods_end: start_date
        })
        await newPeriods.save()
        return res.status(200).json({ message: "Periods Start date updated" })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: err.message });
    }
});

router.post('/period-end', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        const current_user = req.user["email"]
        const { end_date } = req.body;
        const periods = await PeriodsDates.findOne({ user: current_user })
        periods.periods_end = end_date
        await periods.save()
        return res.status(200).json({ message: "Periods End date updated" })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: err.message });
    }
});

router.get('/getdata', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        const current_user = req.user["email"]
        const date = new Date
        const current_month = date.getMonth();
        const current_year = date.getFullYear()
        const periodsupdated = await PeriodsDates.findOne({user:current_user})
        const periods = await PeriodsMonthly.find({ user: current_user}).select('-__v -_id') //, period_month: current_month 
        if (periods.length>0) {
            return res.status(200).json({ period_dates: periods })
        } else {
            // Define the two dates
            function formatDate(dateString) {
                const [year, month, day] = dateString.split('-').map(Number);
                return [year, month - 1, day];
            }
            const date1formated = formatDate(periodsupdated.periods_end);
            const date2formated = formatDate(periodsupdated.periods_start);
            const date1 =  new Date(date1formated); // May 15, 2023
            const date2 =  new Date(date2formated); // April 20, 2023

            // Calculate the difference in milliseconds
            const diffInMs = date1.getTime() - date2.getTime();

            // Convert the difference from milliseconds to days
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            // Generate an array with dates from date2 to date1
            const datesArray = Array.from({ length: diffInDays }, (_, i) => {
                const date = new Date(date2.getTime() + i * 24 * 60 * 60 * 1000);
                return date.getDate();
            });
            // console.log("Array of dates:", datesArray);
            const newPeriodMonth = new PeriodsMonthly({
                period_dates:String(datesArray),
                period_month:current_month,
                period_year:current_year,
                user:current_user
            });
            await newPeriodMonth.save()
            return res.status(200).json({ message: "Periods End date updated", period_dates:newPeriodMonth  })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: err.message });
    }
})


module.exports = router;