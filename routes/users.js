const express = require('express')
const router = express.Router()
const { User } = require('../models/users')
const mongoose = require('mongoose');

router.get('/login',(req,res)=>{
    res.json({ message: 'Login' });
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
    let users = await User.find({email:body_email}).exec();
    console.log(users);
    
});
module.exports = router;