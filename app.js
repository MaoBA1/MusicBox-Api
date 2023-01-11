const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const ip = '192.168.1.42';
const cors = require('cors');
const accountRouter = require('./controllers/accounts');
const superAccount = require('./controllers/superUser');
const generRouter = require('./controllers/gener');
const songRouter = require('./controllers/song');
const postRouter = require('./controllers/post');
const albumRouter = require('./controllers/album');

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
app.use('/api/post', postRouter);
app.use('/api/album', albumRouter);

const url = 'mongodb+srv://kiosk_user:maor1997@cluster0.4l8lk.mongodb.net/MusicBox_db?retryWrites=true&w=majority';
mongoose.connect(url)
.then(results => {
    console.log(results);
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is listening on port ${port}`);
    });
})
.catch(err => {
    console.log(err);
})

