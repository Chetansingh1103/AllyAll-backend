const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    userId:{
        type: String,
        require: true,
        ref: 'users'
    },
    username:{
        type: String,
        require: true,
        ref: 'users'
    },
    image:{
        type: String,
        require: true
    },
    likeCount:{
        type: Number,
        default: 0
    },
    commentCount:{
        type: Number,
        default: 0
    },
    textBody: {
        type: String,
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    creationDateTime: {
        type: Date,
        default: Date.now
    },
    deletionDateTime: {
        type: Date,
        require: false
    }
})

module.exports = mongoose.model("posts", PostSchema);