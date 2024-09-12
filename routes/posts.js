const express = require("express");
const { authenticator } = require("../middleware/authMiddle");
const { Post_Model } = require("../models/post.model");

const Post_Router = express.Router();

/*
1.	Create a Stock Post - POST /api/posts
○	Headers: { Authorization: Bearer <token> }
○	Request Body: { stockSymbol, title, description, tags }
○	Response: { success: true, postId, message: 'Post created successfully' }
*/

Post_Router.post("/", authenticator, async (req, res) => {
  const { stockSymbol, title, description, tags } = req.body;
  try {
    const newPost = new Post_Model({
      user: req.user.id,
      stockSymbol,
      title,
      description,
      tags,
    });
    const post = await newPost.save();
    res
      .status(200)
      .send({
        success: true,
        postId: post.id,
        message: "Post created successfully",
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ "Server Error": error.message });
  }
});

/*
2.	Get All Stock Posts (with filters and sorting) - GET /api/posts
○	Query Parameters:
■	stockSymbol (optional)
■	tags (optional)
■	sortBy (date or likes, optional)
○	Response: [ { postId, stockSymbol, title, description, likesCount, createdAt } ]
*/

Post_Router.get("/", async (req, res) => {
  const { stockSymbol, tags, sortBy } = req.query;
  try {
    let query = {};
    if (stockSymbol) query.stockSymbol = stockSymbol;
    if (tags) query.tags = { $in: tags.split(",") };

    let sort = {};
    if (sortBy === "date") sort.createdAt = -1;
    if (sortBy === "likes") sort.likes = -1;

    const posts = await Post_Model.find(query)
      .sort(sort)
      .select("stockSymbol title description likes createdAt ");

    res
      .status(200)
      .send({
        posts
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ "Server Error": error.message });
  }
});

/*
3.	Get a Single Stock Post (with comments) - GET /api/posts/:postId
○	Response: { postId, stockSymbol, title, description, likesCount, comments: [ { commentId, userId, comment, createdAt } ] }
*/

Post_Router.get('/:postId', async (req, res) => {
    try {
        const post = await Post_Model.findById(req.params.postId)
            .populate('user', 'username')
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username' }
            });

        if (!post) {
            return res.status(404).send({ msg: 'Post not found' });
        }

        res.status(200).send(post);
    } catch (error) {
        console.error(error.message);
    res.status(500).send({ "Server Error": error.message });
    }
});

module.exports = { Post_Router };

/*
4.	Delete a Stock Post - DELETE /api/posts/:postId
○	Headers: { Authorization: Bearer <token> }
○	Response: { success: true, message: 'Post deleted successfully' }
*/
Post_Router.delete('/:postId', authenticator, async (req, res) => {
    try {
        const post = await Post_Model.findById(req.params.postId);
        if (!post) {
            return res.status(404).send({ msg: 'Post not found' });
        }

    // Checking if the logged-in user is the one who created the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized' });
        }

        await Post_Model.findByIdAndDelete(req.params.postId);
        res.status(200).send({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error.message);
    res.status(500).send({ "Server Error": error.message });
    }
});

/*
Like System:
1.	Like a Post - POST /api/posts/:postId/like
○	Headers: { Authorization: Bearer <token> }
○	Response: { success: true, message: 'Post liked' }
*/

Post_Router.post('/:postId/like', authenticator, async (req, res) => {
    try {
        const post = await Post_Model.findById(req.params.postId);

        if (!post) {
            return res.status(404).send({ msg: 'Post not found' });
        }

            // Checking if the user has already liked the post
        if (post.likes.includes(req.user.id)) {
            return res.status(400).send({ msg: 'Post already liked' });
        }
         // adding like to the beginning of the likes array 
        post.likes.unshift(req.user.id);
        await post.save();

        res.status(200).send({ success: true, message: 'Post liked' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ "Server Error": error.message });
    }
});


/*
2.	Unlike a Post - DELETE /api/posts/:postId/like
○	Headers: { Authorization: Bearer <token> }
○	Response: { success: true, message: 'Post unliked' }
*/

Post_Router.delete('/:postId/like', authenticator, async (req, res) => {
    try {
        const post = await Post_Model.findById(req.params.postId);

        if (!post) {
            return res.status(404).send({ msg: 'Post not found' });
        }

        if (!post.likes.includes(req.user.id)) {
            return res.status(400).send({ msg: 'Post has not yet been liked' });
        }

        post.likes = post.likes.filter(like => like.toString() !== req.user.id);
        await post.save();

        res.status(200).send({ success: true, message: 'Post unliked' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ "Server Error": error.message });
    }
});
