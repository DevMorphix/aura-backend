require('dotenv').config()
const express = require('express')
const router = express.Router()
const { User,UserOtp } = require('../models/users')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const SECRET = process.env.ACCESS_TOKEN
const jwtExpirySeconds = 300


router.post('/login',async(req,res)=>{
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(400).json({ message: 'Incorrect email' })
        }
        // const correctPassword = await bcrypt.compare(req.body.password, user.password)
        // if (!correctPassword) {
        //     return res.status(400).json({ message: 'Incorrect email or password.' })
        // }
        // const token = jwt.sign({ id: user._id }, SECRET)
        // res.cookie(
        //     "token", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV !== 'development',
        //     sameSite: "strict",
        //     maxAge: jwtExpirySeconds * 1000
        // })
        // res.json({ Token: token })

    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
    // res.json({ message: 'Login' });
});

router.post('/register',async(req,res)=>{
    body_email = req.body.email
    let user = await User.findOne({ email: body_email })
    // if (user) {
    //     return res.status(400).send('User already exisits. Please sign in')
    // } else {
        try {
            // function generateOTP() {
            //     return randomstring.generate({
            //         length: 6,
            //         charset: 'numeric'
            //     });
            // }
            const email = req.body.email
            // const otp = generateOTP();
            // const newOtp = new UserOtp({
            //     otp:otp,
            //     user:email
            // });
            // await newOtp.save();
            // Send OTP via email
        // await sendEmail({
        //     to: email,
        //     subject: 'Your OTP',
        //     message: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        // });
        const newUser = new User({
            conceive:req.body.conceive,
            duration_period:req.body.duration_period,
            last_cycle_regular:req.body.last_cycle_regular,
            last_cycle_irregular_start:req.body.last_cycle_irregular_start,
            last_cycle_irregular_last:req.body.last_cycle_irregular_last,
            last_period_start:req.body.last_period_start,
            email:email,
        })
        await newUser.save()
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
            // const salt = await bcrypt.genSalt(10)
            // const password = await bcrypt.hash(req.body.password, salt)
            // const user = new User({
            //     name: req.body.name,
            //     email: req.body.email,
            //     password: password
            // })
            // await user.save()
            // return res.status(201).json({message:"User Created Successfully"})

        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }
// }
    
);
module.exports = router;