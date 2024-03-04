require('dotenv').config()
const express = require('express')
const router = express.Router()
const { User } = require('../models/users')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const SECRET = process.env.ACCESS_TOKEN
const jwtExpirySeconds = 300

router.post('/login',async(req,res)=>{
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(400).json({ message: 'Incorrect email or password.' })
        }
        const correctPassword = await bcrypt.compare(req.body.password, user.password)
        if (!correctPassword) {
            return res.status(400).json({ message: 'Incorrect email or password.' })
        }
        const token = jwt.sign({ id: user._id }, SECRET)
        // res.cookie(
        //     "token", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV !== 'development',
        //     sameSite: "strict",
        //     maxAge: jwtExpirySeconds * 1000
        // })
        res.json({ Token: token })

    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
    // res.json({ message: 'Login' });
});

router.post('/register',async(req,res)=>{
    // console.log(req.body);
    // res.json({ message: req.body });
        // let user = await UserSchema.findOne({  where: { email: email }  })
    body_email = req.body.email
    // let user = await User.find({email}).exec((err,doc)=>{
    //     if (err){
    //         console.log(err);
    //     }
    // });
    // console.log(user);
    // if (user) {
    //     return res.status(400).send('User already exisits. Please sign in')
    // } else {
    //     try {
    //         const salt = await bcrypt.genSalt(10)
    //         const password = await bcrypt.hash(req.body.password, salt)
    //         const user = new User({
    //             name: req.body.name,
    //             email: req.body.email,
    //             password: password
    //         })
    //         await user.save()
    //         return res.status(201).json(user)
    //     } catch (err) {
    //         return res.status(400).json({ message: err.message })
    //     }
    // }
    // let users = await User.find({email:body_email}).exec();
    // console.log(users);
    try {
        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(req.body.password, salt)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: password
        })
        await user.save()
        return res.status(201).json({ message:"User created" })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
    
});
module.exports = router;