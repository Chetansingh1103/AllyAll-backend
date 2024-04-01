const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    comment: {
        type: String,
        require: true
    },
    userId: {
        type: String,
        ref: 'users',
        require: true
    },
    username: {
        type: String,
        ref: 'users',
        require: true
    },
    postId: {
        type: String,
        ref: 'posts',
        require: true
    },
    commentLikes: {
        type: Number,
        default: 0
    },
    commentId:{
        type: String,
        default: ""
    },
    creationDateTime: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('comments', CommentSchema);
