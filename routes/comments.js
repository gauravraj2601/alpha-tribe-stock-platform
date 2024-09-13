const express = require("express");
const { authenticator } = require("../middleware/authMiddle");
const { Post_Model } = require("../models/post.model");
const { Comment_Model } = require("../models/comment.model");
const Comment_Router = express.Router();



/*
1.	Add a Comment to a Post - POST /api/posts/:postId/comments
○	Headers: { Authorization: Bearer <token> }
○	Request Body: { comment }
○	Response: { success: true, commentId, message: 'Comment added successfully' }
*/


/**
 * @openapi
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     description: Add a new comment to a specific post.
 *     tags: [Comments]
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: ID of the post to add a comment to
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 commentId:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

Comment_Router.post('/:postId/comments', authenticator, async (req, res) => {
    try {
        const post = await Post_Model.findById(req.params.postId);
        if (!post) {
            return res.status(404).send({ msg: 'Post not found' });
        }

        const newComment = new Comment_Model({
            user: req.user.id,
            post: req.params.postId,
            content: req.body.comment
        });

        const comment = await newComment.save();

        // Add comment ID to the post's comments array
        post.comments.push(comment._id);
        await post.save();

        res.status(200).send({ success: true, commentId: comment.id, message: 'Comment added successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({'Server Error':error.message});
    }
});

/*
2.	Delete a Comment - DELETE /api/posts/:postId/comments/:commentId
○	Headers: { Authorization: Bearer <token> }
○	Response: { success: true, message: 'Comment deleted successfully' }
*/

/**
 * @openapi
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete a specific comment from a post.
 *     tags: [Comments]
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: ID of the post
 *         required: true
 *         schema:
 *           type: string
 *       - name: commentId
 *         in: path
 *         description: ID of the comment to delete
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: User not authorized to delete the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "User not authorized"
 *       404:
 *         description: Comment or post not found
 *       500:
 *         description: Server error
 */

Comment_Router.delete('/:postId/comments/:commentId', authenticator, async (req, res) => {
    try {
        const comment = await Comment_Model.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).send({ msg: 'Comment not found' });
        }

        // Checking if the logged-in user is the one who commented the post
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized to delete the comment' });
        }

        await Comment_Model.findByIdAndDelete(req.params.commentId);
        res.status(200).send({ success: true, message: 'Comment deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = {Comment_Router}