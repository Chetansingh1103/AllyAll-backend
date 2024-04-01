const Like = require("../models/Like")
const User = require("../models/User")
const Post = require("../models/Post")

const likePost = async (req, res) => {

    const myUserId = req.locals.userId;
    
    const postId = req.body.postId;

    // database call
    try{

        const checkLike = await Like.find({userId: myUserId, postId: postId})

        if(checkLike[0]){
            return res.status(400).send({
                status: 400,
                message: "You have already liked this post"
            })
        }

        
        const like = new Like({
            userId: myUserId,
            postId: postId
        })


        const post = await Post.findById(postId);

        const updatedPost = await Post.findByIdAndUpdate(postId, { likeCount: post.likeCount + 1 })

        await like.save();

        return res.status(200).send({
            status: 200,
            message: "Liked post successfully!",
        })

    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while Liked",
            data: err.message
        })
    }

}

const unlikePost = async (req, res) => {

    const myUserId = req.locals.userId;
    const postId = req.body.postId;

    try{

        const checkUnlike = await Like.find({userId: myUserId, postId: postId})

        if(!checkUnlike[0]){
            return res.status(400).send({
                status: 400,
                message: "You already unliked this post"
            })
        }

    
        const post = await Post.findById(postId);

        const updatedPost = await Post.findByIdAndUpdate(postId, { likeCount: post.likeCount - 1 })

        const unlike = await Like.findOneAndDelete({userId: myUserId, postId: postId})

        return res.status(200).send({
            status: 200,
            message: "Unliked post successfully!",
        })
    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while Unliked",
        })
    }
}

const checkLike = async (req, res) => {

    const myUserId = req.locals.userId;
    const postId = req.body.postId;

    try{

        const checkLike = await Like.find({userId: myUserId, postId: postId})

        let like = false;

        if(checkLike[0]){

            like = !like;

            return res.status(200).send({
                status: 200,
                message: "You have already liked this post",
                data: {like}
            })
        }

        return res.status(200).send({
            status: 200,
            message: "You have not yet liked this post",
            data: {like}
        })

    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while checking like",
            data: err.message
        })
    }
}

module.exports = {
    likePost,
    unlikePost,
    checkLike
}