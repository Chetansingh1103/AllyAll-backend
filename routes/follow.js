const express = require('express');
const { isAuth } = require('../middlewares/AuthMiddleware');
const { followUser, unfollowUser } = require('../controllers/follow.controller')

const app = express();

// follow 
app.post('/follow-user', isAuth, followUser);

// unfollow

app.post('/unfollow-user', isAuth, unfollowUser);

module.exports = app;