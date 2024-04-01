const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LikeSchema = new Schema({
    userId: {
        type: String,
        ref: 'users',
        require: true
    },
    postId: {
        type: String,
        ref: 'posts',
        require: true
    }
})

module.exports = mongoose.model('likes', LikeSchema);