const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    dob:{
        type: String,
        require: true
    },
    age:{
        type: Number,
        default: 0
    },
    username: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    profilePicture: {
        type: String,
        default: "https://socila-media-app.s3.ap-south-1.amazonaws.com/defaultProfilePicture.png"
    },
    accountDeactivation:{
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        default: ""
    },
    previouslyClickedUserId:{
        type: String,
        default: ""
    },
    creationDateTime: {
        type: Date,
        default: Date.now
    }   
})

module.exports = mongoose.model("users", UserSchema);