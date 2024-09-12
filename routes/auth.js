
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const { User_Model } = require("../models/user.model");
require("dotenv").config();

const authRouter = express.Router();

/*
1.	User Registration - POST /api/auth/register
○	Request Body: { username, email, password }
○	Response: { success: true, message: 'User registered successfully', userId }
*/
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth] 
 *     description: This endpoint allows users to register by providing necessary details like username, email, password, and other optional information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
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
        res.status(200).send({ success: true, message: 'User registered successfully', userId: user._id });

    } catch (error) {
        res.status(500).send({ success: false, message: 'Error registering user' });

    }
})

/*
2.	User Login - POST /api/auth/login
○	Request Body: { email, password }
○	Response: { token, user: { id, username, email } }
*/


/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Authenticate a user and return a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */


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


