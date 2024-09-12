
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const { User_Model } = require("../models/user.model");
require("dotenv").config();

const authRouter = express.Router();

authRouter.post("/register", async(req, res)=>{
    const {username, email, password} = req.body;
    
    try {
        let user = await User_Model.findOne({email});
        if(user){
           return res.status(400).send({"msg":"User already exists, Please Login"});
        } 
        user = new User_Model({
            username,
            email,
            password
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).send({ success: true, message: 'User registered successfully', registeredUser: user });

    } catch (error) {
        res.status(500).send({ success: false, message: 'Error registering user' });

    }
})

authRouter.post("/login", async(req, res)=>{
    const {email, password} = req.body;
    try {
        const user = await User_Model.findOne({ email });
        if (!user) return res.status(404).send({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(200).send({ token, user: { id: user._id, username: user.username, email: user.email } });


    } catch (error) {
        res.status(500).json({ message: 'Server error' });

    }
})

module.exports = {
    authRouter
}


/*

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    const user = await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

module.exports = router;



*/