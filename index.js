const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const cors = require('cors');
const accountRouter = require('./controllers/accounts');
const superAccount = require('./controllers/superUser');
const generRouter = require('./controllers/gener');
const songRouter = require('./controllers/song');
app.use(
    cors({
        origin: '*'
    })
)

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());
app.use('/api/accounts', accountRouter);
app.use('/api/superUser', superAccount);
app.use('/api/gener', generRouter);
app.use('/api/song', songRouter);

const url = 'mongodb+srv://kiosk_user:maor1997@cluster0.4l8lk.mongodb.net/MusicBox_db?retryWrites=true&w=majority';
mongoose.connect(url)
.then(results => {
    console.log(results);
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
})
.catch(err => {
    console.log(err);
})