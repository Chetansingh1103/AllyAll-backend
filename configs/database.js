const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
.then((res) => {
    console.log("MongoDB is Connected")
})
.catch((err) => {
    console.log(err)
})