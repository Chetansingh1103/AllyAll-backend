const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');

// importing database
const database = require("./configs/database")
const userRoutes = require("./routes/user")
const postRoutes = require("./routes/post")
const followRoutes = require('./routes/follow')
const likeRoutes = require('./routes/like')
const commentRoutes = require('./routes/comment')
const {keepBackendActive} = require('./utils/cron')

const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({origin: "*"}))



//-----------------------routes--------------------------

// user route
app.use("/user", userRoutes);

// post route
app.use("/post", postRoutes);

// follow route
app.use("/follow", followRoutes)

// like route
app.use("/like", likeRoutes)

// comment route
app.use("/comment", commentRoutes)


app.listen(PORT, () => {
    console.log("Server running on port: ", PORT);

    keepBackendActive();
})