const express = require('express');
const { isAuth } = require('../middlewares/AuthMiddleware');
const { likePost, unlikePost, checkLike } = require('../controllers/like.controller')

const app = express();

// Like post 
app.post('/like-post', isAuth, likePost);

// Unlike post
app.post('/unlike-post', isAuth, unlikePost);

// check like
app.post('/check-like', isAuth, checkLike);


module.exports = app;
