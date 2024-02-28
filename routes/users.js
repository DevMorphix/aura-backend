const express = require('express')
const router = express.Router()


router.get('/login',(req,res)=>{
    res.json({ message: 'Login' });
});

router.post('/register',(req,res)=>{
    console.log(req.body);
    res.json({ message: req.body });
});
module.exports = router;