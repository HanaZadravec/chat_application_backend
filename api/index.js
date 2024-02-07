const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const bcrypt = require('bcrypt');

dotenv.config();

mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;

mongoose.connection.on('connected', () => {
    console.log('Database connected');
});

const app = express();
app.use(express.json());
const port = 5000;

app.use(cookieParser());
console.log(process.env.CLIENT_URL);
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

app.get('/', (req, res) => {
    res.json('test ok');
});

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password,10);
      const createdUser = await User.create({
        username:username,
        password:hashedPassword,
      });
      jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
        res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
          id: createdUser._id,
        });
      });
    } catch(err) {
      res.status(500).json('error');
    }
  });

app.listen(port, () => {
    console.log(`App is running on ${port}`);
});
