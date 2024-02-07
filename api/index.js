const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on('connected', () => {
    console.log('Database connected');
});

const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.json('test ok');
});

app.post('/register', (req, res) => {
    res.json('register ok');
});

app.listen(port, () => {
    console.log(`App is running on ${port}`);
});
