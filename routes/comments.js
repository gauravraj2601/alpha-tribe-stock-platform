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
Comment_Router.delete('/:postId/comments/:commentId', authenticator, async (req, res) => {
    try {
        const comment = await Comment_Model.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).send({ msg: 'Comment not found' });
        }

        // Checking if the logged-in user is the one who commented the post
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized' });
        }

        await Comment_Model.findByIdAndDelete(req.params.commentId);
        res.status(200).send({ success: true, message: 'Comment deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = {Comment_Router}