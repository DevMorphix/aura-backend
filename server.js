const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const app = express();

app.use(bodyParser.json());
// BodyParser
app.use(express.urlencoded({ extended: false }));


// DB Config
const db = require('./config/keys').MongoURI
mongoose.connect(db,{ useNewUrlParser: true })
  .then(()=> console.log("MongoDB Connected..."))
  .catch(err => console.log(err))

const port = process.env.PORT || 3000;
app.use('/',require('./routes/index'))
app.use('/users',require('./routes/users'))
app.get('/api/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});