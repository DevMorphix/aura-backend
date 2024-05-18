require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Notes } = require('../models/notes')
const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');
const { v4: uuidv4 } = require('uuid');


router.get('/', isAuthenticated, async (req, res) => {
    try {
        const current_user = req.user["email"];
        const note = await Notes.find({user:current_user}).select('-_id -__v')
        return res.status(200).json({ Note: note})
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })

    }
});

router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const user = req.user["email"];
        const content = req.body.content;
        const title = req.body.title;
        const newNotes = new Notes({
            note_id:uuidv4(),
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

router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const note = await Notes.findOne({note_id:req.params.id}).select('-_id -__v')
        return res.status(200).json({ Note: note})
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })

    }
});


module.exports = router;