require('dotenv').config()
const express = require('express')
const router = express.Router()
const { Notes } = require('../models/notes')
const mongoose = require('mongoose');
const isAuthenticated = require('../middlware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all Notes as per user filter

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

// Add Notes
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

// Get Notes by note_id
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Notes.findOne({note_id:noteId}).select('-_id -__v')
        return res.status(200).json({ Note: note})
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })

    }
});

// Update Note by note_id
router.patch('/:id', isAuthenticated, async (req, res) => {
    try {
        const user = req.user["email"];
        const content = req.body.content;
        const title = req.body.title;
        const noteId = req.params.id;

        const note = await Notes.findOne({note_id:noteId})
        note.content = content
        note.title = title
        note.updated_at = Date.now()
        await note.save()
        return res.status(200).json({ message: "Note Updated"})
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })

    }
});

// Delete note by note_id
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const user = req.user["email"];
        const noteId = req.params.id;
        const note = await Notes.findOne({note_id:noteId})
        if (!note) {
            return res.status(404).json({ message: 'Note not found or Note already deleted'});
        }
        await Notes.deleteOne({ note_id: noteId, user });
        return res.status(200).json({ message: "Note Deleted Successfully"})
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })

    }
});

module.exports = router;