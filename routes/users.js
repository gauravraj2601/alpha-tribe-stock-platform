const express = require("express");
const { authenticator } = require("../middleware/authMiddle");
const { User_Model } = require("../models/user.model");
const userRouter  = express.Router();


/*
3.	Get User Profile - GET /api/user/profile/:userId
○	Headers: { Authorization: Bearer <token> }
○	Response: { id, username, bio, profilePicture }
*/
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT  # Specify that it's a JWT token
 * 
 * security:
 *   - BearerAuth: []  # Apply globally to all endpoints
 * 
 * /api/user/profile/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Retrieve user profile information.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

userRouter.get('/profile/:userId', authenticator, async (req, res) => {
    try {
        const user = await User_Model.findById(req.params.userId).select('-password'); // excludes sensitive information like passwords.
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).send(
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

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating profile
 */

userRouter.put('/profile', authenticator, async (req, res) => {
    try {
      const { username, bio, profilePicture } = req.body;
      const user = await User_Model.findByIdAndUpdate(req.user.id, { username, bio, profilePicture }, { new: true });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
      res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile' });
    }
  });

  

module.exports ={userRouter}
