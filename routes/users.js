const express = require("express");
const { authenticator } = require("../middleware/authMiddle");
const { User_Model } = require("../models/user.model");
const userRouter  = express.Router();


/*
3.	Get User Profile - GET /api/user/profile/:userId
○	Headers: { Authorization: Bearer <token> }
○	Response: { id, username, bio, profilePicture }
*/

userRouter.get('/profile/:userId', authenticator, async (req, res) => {
    try {
        const user = await User_Model.findById(req.params.userId).select('-password'); // excludes sensitive information like passwords.
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(
            {
                id: user._id,
                username: user.username,
                bio: user.bio,
                profilePicture: user.profilePicture
              }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/*
4.	Update User Profile - PUT /api/user/profile
○	Headers: { Authorization: Bearer <token> }
○	Request Body: { username, bio, profilePicture }
○	Response: { success: true, message: 'Profile updated' }
*/

userRouter.put('/profile', authenticator, async (req, res) => {
    try {
      const { username, bio, profilePicture } = req.body;
      const user = await User_Model.findByIdAndUpdate(req.user.id, { username, bio, profilePicture }, { new: true });
      
      res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile' });
    }
  });

  

module.exports ={userRouter}