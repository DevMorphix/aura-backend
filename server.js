const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const app = express();
const cors = require('cors');


app.use(cors());
app.use(express.json())

app.use(bodyParser.json());
// BodyParser
app.use(express.urlencoded({ extended: false }));


// DB Config
const db = require('./config/keys').MongoURI
mongoose.connect(db)
  .then(()=> console.log("MongoDB Connected..."))
  .catch(err => console.log(err))

const port = process.env.PORT || 3000;
app.use('/index',require('./routes/index'))
app.use('/users',require('./routes/users'))
app.use('/notes',require('./routes/notes'))
// app.use('/appoinment',require('./routes/appoinment'))
app.use('/admin',require('./routes/admin'));
app.use('/admin-analytics',require('./routes/admin_analatics'));
app.use('/user-analytics',require('./routes/user_analatics'));





app.get('/api/', (req, res) => {
    res.json({ status:200,message: 'API Working Properly' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});