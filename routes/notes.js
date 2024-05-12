require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Notes } = require('../models/notes')
const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');


router.patch('/add', isAuthenticated, async (req, res) => {
    try {
        const user = req.user["email"];
        const update = { content: req.body.content };
        // const note = await Notes.findOneAndUpdate(user,update, { new: true })
        const note = await Notes.findOne({ user });
        if (!note) {
            const newNote = new Notes({
                user: user,
                content: ""
            })
            await newNote.save()
        }
        note.content = req.body.content;

        await note.save();

        return res.status(200).json({
            status: 200,
            message: 'Notes updated successfully'
        });
        // return res.status(200).json({ message: "Notes updated" })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })

    }
});


module.exports = router;