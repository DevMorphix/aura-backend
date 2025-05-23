require('dotenv').config()
const express = require('express')
const crypto = require('crypto');
const router = express.Router()
const { Users, UserOtp, UserDetails, ResetPassword } = require('../models/users')
const { Notes } = require('../models/notes')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET_KEY
const jwtExpirySeconds = 300
const { sendEmail } = require('../utils/sendEmail');
const nodeMailer = require("nodemailer");
const isAuthenticated = require('../middlware/auth');
const isUserValidate = require('../middlware/user');
const { Appoinments } = require('../models/appoinment');
const { PeriodsDates, PeriodsMonthly } = require('../models/user_analatics');

router.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        let user = await Users.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or Invalid user" })
        }
        else {
            if (user.verified == true) {
                const correctPassword = await bcrypt.compare(password, user.password)
                if (!correctPassword) {
                    return res.status(400).json({ message: "Incorrect email or password." })
                }
                const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '20d' })
                const userdata = await UserDetails.findOne({ email: user.email }).select('-_id -__v -is_admin')
                return res.status(200).json({ UserData: userdata, Token: token })
            } else {
                return res.status(400).json({ message: "User not verified" })
            }
        }

    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
});

router.post('/verify', async (req, res, next) => {
    try {
        let { otp, email, password } = req.body;
        let otpUser = await UserOtp.findOne({ otp: otp })

        if (!otpUser) {
            return res.status(404).json({ message: "OTP not found or invalid OTP" });
        }

        if (otpUser.user !== email) {
            return res.status(404).json({ message: "User email does not match OTP user" });
        }

        if (!otpUser && !otpUser.user === email) {
            return res.status(404).json({ message: "OTP not found or invalid OTP" });
        } else {
            const user_email = email
            const user_password = password
            const salt = await bcrypt.genSalt(10)
            const salted_password = await bcrypt.hash(user_password, salt)
            const newUser = new Users({
                email: user_email,
                password: salted_password
            });
            await newUser.save()

        }

        let user = await Users.findOne({ email: otpUser.user })

        if (otpUser) {
            if (!otpUser.verified) {
                const token = jwt.sign({ email: otpUser.user }, process.env.SECRET_KEY, { expiresIn: '20d' })
                otpUser.verified = true
                await otpUser.save()
                user.verified = true
                await user.save()
                await otpUser.deleteOne({ verified: true });
                return res.status(200).json({ message: "User Created Successfully", Token: token });
            }
            else {
                return res.status(404).json({ message: "This otp already used" });
            }
        } else {
            return res.status(404).json({ message: "OTP not found or invalid OTP" });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
})

router.post('/register', async (req, res) => {
    body_email = req.body.email
    let user = await Users.findOne({ email: body_email })
    if (user) {
        return res.status(400).json({ message: 'Email id already used' })
    } else {
        try {
            const email = req.body.email

            const randomNumber = Math.floor(Math.random() * 900000) + 100000;
            // console.log(`Random 6-digit number: ${randomNumber}`);
            const newOtp = new UserOtp({
                otp: randomNumber,
                user: email
            });
            await newOtp.save();
            // Send OTP via email

            async function mailSend(options) {
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
            return res.status(201).json({ message: "User Created Successfully  & Email send", randomNumber: randomNumber });
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }
});

router.post('/userdetail', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        const { conceive, duration_period, last_cycle_regular, last_cycle_irregular_start, last_cycle_irregular_last, last_period_start, period_length_regular, period_length_irregular_start, period_length_irregular_end } = req.body;
        const current_user = req.user["email"]
        const user = await UserDetails.find({ email: current_user })
        // console.log(us);
        if (user.length > 0) {
            return res.status(201).json({ message: "User Already completed the form" })
        }
        const newDetails = new UserDetails({
            conceive: conceive,
            duration_period: duration_period,
            last_cycle_regular: last_cycle_regular,
            last_cycle_irregular_start: last_cycle_irregular_start,
            last_cycle_irregular_last: last_cycle_irregular_last,
            last_period_start: last_period_start,
            email: current_user,
            period_length_regular: period_length_regular,
            period_length_irregular_start: period_length_irregular_start,
            period_length_irregular_end: period_length_irregular_end
        })
        await newDetails.save()
        const userdata = await UserDetails.findOne({ email: current_user }).select('-_id -__v')
        return res.status(200).json({ userdata: userdata, message: "User Details Updated" })

    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
});

router.post('/otpresend', async (req, res) => {
    try {
        const email = req.body.email;
        const otpVerify = await UserOtp.findOne({ user: email });
        if (otpVerify && otpVerify.verified == false) {
            async function mailSend(options) {
                const mailOptions = {
                    from: process.env.SMPT_MAIL,
                    to: email,
                    subject: "You SheCare OTP ",
                    html: `<p>${otpVerify.otp}</p>`
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
            return res.status(200).json({ message: "Otp Resented" , otp: otpVerify.otp });
        }
        else {
            return res.status(404).json({ message: "Otp not found" })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

router.post('/forgotPassword', async (req, res) => {
    try {
        const email = req.body.email;
        let user = await Users.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ message: "Email not found" })
        } else {
            var resetToken = crypto.randomBytes(64).toString('hex');
            const tokenExpiration = Date.now() + 3600000;

            const reset = new ResetPassword({
                token: resetToken,
                tokenExpiration: tokenExpiration,
                user: user.email
            });
            await reset.save()


            async function mailSend(options) {
                const mailOptions = {
                    from: process.env.SMPT_MAIL,
                    to: email,
                    subject: "You SheCare Password Reset Link ",
                    html: `<p>https://aura.badhusha.me/resetpassword?token=${resetToken}</p>`
                };

                const transporter = nodeMailer.createTransport({
                    debug: true,
                    // host: process.env.SMPT_HOST,
                    // port: process.env.SMPT_PORT,
                    service: 'gmail',
                    secure: true, // Use SSL
                    auth: {
                        user: process.env.SMPT_MAIL,
                        pass: process.env.SMPT_APP_PASS,
                    },
                    // tls: {
                    //     rejectUnauthorized: false
                    // },
                    // connectionTimeout: 30000, // 30 seconds
                    // greetingTimeout: 30000,   // 30 seconds
                    // socketTimeout: 30000      // 30 seconds

                });
                await transporter.sendMail(mailOptions);
            }
            mailSend();
            return res.status(200).json({ message: "Check your email you will receive a link for reset the password" });

        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

// For user token verification
router.post('/reset-password/:token', async (req, res) => {
    try {
        const token = req.params['token'];
        const newPassword = req.body.newPassword;
        const user = await ResetPassword.findOne({ token: token });
        const user_password = await Users.findOne({ email: user.user });
        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Check if the token has expired
        if (Date.now() > user.tokenExpiration) {
            return res.status(401).json({ message: 'Token expired' });
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user_password.password = hashedPassword;
        await user_password.save()
        return res.status(200).json({ message: "Password Changed Successfully" });
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

router.post('/personaldetails', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        const current_user = req.user["email"];
        const { full_name, dob, phone_number } = req.body;
        const userdetails = await UserDetails.findOne({ email: current_user })
        if (userdetails) {
            userdetails.full_name = full_name
            userdetails.dob = dob
            userdetails.phone_number = phone_number
            userdetails.dob_year = dob.slice(0, 4)
            await userdetails.save()
            return res.status(200).json({ message: "Userdetails Updated Successfully" });
        } else {
            return res.status(404).json({ message: "UserDetails Not Found" });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

router.post('/delete-account', isAuthenticated, isUserValidate, async (req, res) => {
    try {
        const email = req.body.email
        const user = await Users.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or Email id not found" })
        } else {
            await UserDetails.deleteMany({ email: email });
            await Users.deleteMany({ email: email });
            await Notes.deleteMany({ user: email });
            await Appoinments.deleteMany({ user: email });
            await PeriodsDates.deleteMany({ user: email });
            await PeriodsMonthly.deleteMany({ user: email });
            await UserOtp.deleteMany({ user : email });
            await ResetPassword.deleteMany({ user : email });
            return res.status(200).json({ message: "User Deleted Successfully" });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

// router.post('/add-admin', async (req, res) => {
//     try {
//         const user = await UserDetails.findOne({ email: "" })
//         user.is_admin = true
//         await user.save()
//         return res.status(200).json({ message: "Updated to admin" });
//     } catch (err) {
//         return res.status(400).json({ message: err.message })
//     }
// });
module.exports = router;