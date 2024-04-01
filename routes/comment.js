const express = require('express');
const { isAuth } = require('../middlewares/AuthMiddleware');
const { createComment, getPostComments, getCommentReplies } = require("../controllers/comment.controller")


const app = express();

// create comment
app.post('/create-comment', isAuth, createComment);

// get post comments
app.get('/get-post-comments/:postId', isAuth, getPostComments);

// get comment replies
app.get('/get-comment-replies/:commentId', isAuth, getCommentReplies);


module.exports = app;