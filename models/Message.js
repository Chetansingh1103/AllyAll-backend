const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    senderUserId: {
        type: String,
        ref: 'users',
        require: true
    },
    receiverUserId: {
        type: String,
        ref: 'users',
        require: true
    },
    messageBody: {
        type: String,
        require: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('messages', MessageSchema)