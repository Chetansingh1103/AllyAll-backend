const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtpSchema = new Schema({
    email:{
        type: String,
        require: true
    },
    otp:{
        type: String,
        require: true,
        unique: true
    }
})

module.exports = mongoose.model('otps', OtpSchema)