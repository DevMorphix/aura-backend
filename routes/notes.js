require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Notes } = require('../models/notes')
const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');


router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const user = req.user["email"];
        const content = req.body.content;
        const title = req.body.title;
        const newNotes = new Notes({
            user:user,
            content:content,
            title:title
        });
        await newNotes.save()
        return res.status(200).json({ message: "Notes updated" })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })

    }
});


module.exports = router;