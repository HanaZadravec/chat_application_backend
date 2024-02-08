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
bcryptSalt= bcrypt.genSaltSync(10);

mongoose.connection.on('connected', () => {
    console.log('Database connected');
});

const app = express();
app.use(express.json());
const port = 5000;


app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));

app.get('/', (req, res) => {
    res.json('test ok');
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  if(token){
    jwt.verify(token, jwtSecret, {}, (err, user) => {
      if(err) {
        return res.status(401).json('not authorized');
      }
      res.json(user);
    }); 
  }else{
    res.status(401).json('not authorized');
  }
  
});

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password,bcryptSalt);
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

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const foundUser=await User.findOne({username});
  if(foundUser){
    if(bcrypt.compareSync(password,foundUser.password)){
      jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
        res.cookie('token', token, {sameSite:'none', secure:true}).status(200).json({
          id: foundUser._id,
        });
      });
    }else{
      res.status(401).json('not authorized');
  }
}});


app.listen(port, () => {
    console.log(`App is running on ${port}`);
});
