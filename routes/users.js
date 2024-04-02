require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Users,UserOtp } = require('../models/users')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET_KEY
const jwtExpirySeconds = 300
const {sendEmail} = require('../utils/sendEmail');
const nodeMailer = require("nodemailer");
const isAuthenticated = require('../middlware/auth');

router.post('/login',async(req,res)=>{
    try {
        let user = await Users.findOne({ email: req.body.email })
        if (!user) {
            return res.status(400).json({ message: 'Incorrect email' })
        }
        else{
            

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
        return res.status(200).json({ message: "Email send to the user" })

    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
});

router.post('/verify',async(req,res,next)=>{
    try{
        const { otp } = req.body;
        let otpUser = await UserOtp.findOne({otp:otp})
        let user = await Users.findOne({email:otpUser.user})
        if (otpUser){
            if(!otpUser.verified){
                const token = jwt.sign({ email: otpUser.user }, process.env.SECRET_KEY,{expiresIn: '20d'})
                otpUser.verified = true
                await otpUser.save()
                user.verified = true
                await user.save()
                await otpUser.deleteOne({ verified: true });
                return res.status(200).json({ Token: token });
            }
            else{
                return res.status(404).json({ message: "This otp already used" });
            }
        }else{
            return res.status(404).json({ message: "OTP not found or invalid OTP" });
        }
    }catch(err){    
        return res.status(400).json({ message: err.message });
    }
})

router.post('/register',async(req,res)=>{
    body_email = req.body.email
    let user = await Users.findOne({ email: body_email })
    if (user) {
        return res.status(400).send('Email id already used')
    } else{
        try {
            email = req.body.email
            user_password = req.body.password
            const salt = await bcrypt.genSalt(10)
            const password = await bcrypt.hash(user_password, salt)
            const newUser = new Users({
                email:email,
                password: password
            });
            await newUser.save()
            
            const randomNumber = Math.floor(Math.random() * 900000) + 100000;
            console.log(`Random 6-digit number: ${randomNumber}`);
            const newOtp = new UserOtp({
                otp:randomNumber,
                user:req.body.email
            });
            await newOtp.save();
            // Send OTP via email
            
            async function mailSend(options){
                    const mailOptions = {
                    from: process.env.SMPT_MAIL,
                    to: email,
                    subject: "You SheCare OTP ",
                    html: `<p>${randomNumber}</p>`
                };

                const transporter = nodeMailer.createTransport({
                    // host: process.env.SMPT_HOST,
                    // port: process.env.SMPT_PORT,
                    service: 'gmail',
                    secure: true, // Use SSL
                    auth: {
                        user: process.env.SMPT_MAIL,
                        pass: process.env.SMPT_APP_PASS,
                    },

                });
                await transporter.sendMail(mailOptions);
            }
            mailSend();
            return res.status(201).json({message:"User Created Successfully & Details added to database & Email send"})
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }
}
    
);

router.post('/userdetail',isAuthenticated,async(req,res)=>{
    try{
        const { conceive,duration_period,last_cycle_regular,last_cycle_irregular_start,last_cycle_irregular_last,last_period_start,email} = req.body;
        const current_user = req.user["email"]
        return res.status(201).json({message:"User Created Successfully & Details added to database & Email send"})

    }catch (err) {
        return res.status(400).json({ message: err.message })
    }
});
module.exports = router;