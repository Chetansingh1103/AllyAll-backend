const express = require('express')
const { isAuth } = require('../middlewares/AuthMiddleware')
const { createPost, getAllMyPosts, getFeedPosts, deletePost, getSinglePost } = require('../controllers/post.controller')


const app = express();


// create post
app.post("/create-post", isAuth, createPost)

// get all my posts

app.get("/get-all-my-posts", isAuth, getAllMyPosts);

// get feed posts

app.get("/get-feed-posts", isAuth, getFeedPosts);

// delete post

app.delete("/delete-post/:id", isAuth, deletePost);

// get single post

app.get("/get-single-post/:id", isAuth, getSinglePost);




module.exports = app;