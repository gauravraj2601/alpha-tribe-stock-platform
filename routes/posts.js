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


/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new stock post
 *     description: Create a new post related to a specific stock.
 *     security:
 *       - BearerAuth: []
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stockSymbol
 *               - title
 *               - description
 *             properties:
 *               stockSymbol:
 *                 type: string
 *                 example: AMZN
 *               title:
 *                 type: string
 *                 example: Is Amazon's Cloud Division Driving Its Growth?
 *               description:
 *                 type: string
 *                 example: Amazon (AMZN) continues to dominate in e-commerce, but its AWS cloud division is quickly becoming a major profit center.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [tag1, tag2]
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 postId:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
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
    res.status(200).send({
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

Optional
1.	Paginated Posts Retrieval - GET /api/posts
○	Query Parameters:
■	page (optional, default: 1)
■	limit (optional, default: 10)
○	Response: [ { postId, stockSymbol, title, description, likesCount, createdAt } ] with pagination metadata.
*/

/**
 * @openapi
 * /api/posts:
 *   get:
 *     summary: Get all stock posts
 *     description: Retrieve a list of stock posts with optional filters and pagination.
 *     tags: [Posts]
 *     parameters:
 *       - name: stockSymbol
 *         in: query
 *         description: Filter posts by stock symbol
 *         required: false
 *         schema:
 *           type: string
 *       - name: tags
 *         in: query
 *         description: Filter posts by tags
 *         required: false
 *         schema:
 *           type: string
 *           example: tag1,tag2
 *       - name: sortBy
 *         in: query
 *         description: Sort posts by date or likes
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - date
 *             - likes
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of posts per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of stock posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalPosts:
 *                       type: integer
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postId:
 *                         type: string
 *                       stockSymbol:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       likesCount:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */

Post_Router.get("/", async (req, res) => {
  const { stockSymbol, tags, sortBy, page = 1, limit = 10 } = req.query;

  try {
    let query = {};
    if (stockSymbol) query.stockSymbol = stockSymbol;
    if (tags) query.tags = { $in: tags.split(",") };

    let sort = {};
    if (sortBy === "date") sort.createdAt = -1;
    if (sortBy === "likes") sort.likes = -1;

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalPosts = await Post_Model.countDocuments(query);

    // posts with sorting, filtering, and pagination
    const posts = await Post_Model.find(query)
      .sort(sort)
      .select("stockSymbol title description likes createdAt ")
      .limit(limitNumber)
      .skip(skip);

    // Pagination metadata
    const pagination = {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalPosts / limitNumber),
      totalPosts,
    };

     // Format response: include likesCount
     const formattedPosts = posts.map(post => ({
        postId: post._id,
        stockSymbol: post.stockSymbol,
        title: post.title,
        description: post.description,
        likesCount: post.likes.length,  // Adding likes count here
        createdAt: post.createdAt
      }));

    res.status(200).send({
      pagination,
      posts: formattedPosts,
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


/**
 * @openapi
 * /api/posts/{postId}:
 *   get:
 *     summary: Get a single stock post
 *     description: Retrieve a single post along with comments.
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: ID of the post to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single post with comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 postId:
 *                   type: string
 *                 stockSymbol:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 likesCount:
 *                   type: integer
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       commentId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       comment:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */


Post_Router.get("/:postId", async (req, res) => {
  try {
    const post = await Post_Model.findById(req.params.postId)
      .populate("user", "username")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" },
      });

    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
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


/**
 * @openapi
 * /api/posts/{postId}:
 *   delete:
 *     summary: Delete a stock post
 *     description: Delete a specific post.
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: ID of the post to delete
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

Post_Router.delete("/:postId", authenticator, async (req, res) => {
  try {
    const post = await Post_Model.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    // Checking if the logged-in user is the one who created the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).send({ msg: "User not authorized" });
    }

    await Post_Model.findByIdAndDelete(req.params.postId);
    res
      .status(200)
      .send({ success: true, message: "Post deleted successfully" });
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

/**
 * @swagger
 * /api/posts/{postId}/like:
 *   post:
 *     summary: Like a post
 *     description: Add a like to a post by its ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: Post ID to like
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Post liked
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
 *         description: Post not found
 *       400:
 *         description: Post already liked
 *       500:
 *         description: Server error
 */

Post_Router.post("/:postId/like", authenticator, async (req, res) => {
  try {
    const post = await Post_Model.findById(req.params.postId);

    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    // Checking if the user has already liked the post
    if (post.likes.includes(req.user.id)) {
      return res.status(400).send({ msg: "Post already liked" });
    }
    // adding like to the beginning of the likes array
    post.likes.unshift(req.user.id);
    await post.save();

    res.status(200).send({ success: true, message: "Post liked" });
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

/**
 * @openapi
 * /posts/{postId}/like:
 *   delete:
 *     summary: Unlike a post
 *     description: Remove a like from a post by its ID.
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: ID of the post to unlike
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Post unliked
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
 *                   example: "Post unliked"
 *       404:
 *         description: Post not found
 *       400:
 *         description: Post has not yet been liked
 *       500:
 *         description: Server error
 */
Post_Router.delete("/:postId/like", authenticator, async (req, res) => {
  try {
    const post = await Post_Model.findById(req.params.postId);

    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    if (!post.likes.includes(req.user.id)) {
      return res.status(400).send({ msg: "Post has not yet been liked" });
    }

    post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
    await post.save();

    res.status(200).send({ success: true, message: "Post unliked" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ "Server Error": error.message });
  }
});


