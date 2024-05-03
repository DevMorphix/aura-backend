require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Notes } = require('../models/notes')
const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');


router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const content = req.body.content;
        const current_user = req.user["email"]
        const notes = await Notes.findOne({ user: current_user })
        if (notes) {
            return res.status(201).json({ message: "User Already a note section" })
        } else {
            const newNotes = new Notes({
                content: req.body.content,
                user: req.body.user
            })
            await newNotes.save()
            return res.status(200).json({ message: "Notes added"})
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
})


module.exports = router;