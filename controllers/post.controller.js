const Post = require("../models/Post")
const joi = require('joi');
const Follow = require('../models/Follow');
const User = require('../models/User');
const Like = require("../models/Like")

const createPost = async (req, res) => {

    const myUserId = req.locals.userId;
    const myUsername = req.locals.username;

    const isValid = joi.object({
        image: joi.string().required(),
        textBody: joi.string()
    }).validate(req.body)

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid input",
            data: isValid.error
        })
    } 

    // databse calls always goes inside try catch
    try{

        const post = new Post({
            userId: myUserId,
            image: req.body.image,
            textBody: req.body.textBody,
            username: myUsername,
        })

        await post.save()

        return res.status(200).send({
            status: 200,
            message: "Post created successfully",
            data: post
        })

    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while fetching data",
            data: err
        })
    }

}

const getAllMyPosts = async (req, res) => {

    const myUserId = req.locals.userId;
    const page = Number(req.query.page) || 1;
    const LIMIT = 10;
    let newPosts = []
    
    // databse calls always goes inside try catch
    try{

        const posts = await Post.find({userId: myUserId, isDeleted: false}).sort({creationDateTime: -1}).skip((page - 1) * LIMIT).limit(LIMIT)

        const user = await User.findById(myUserId)

        posts.forEach((post) => {

            const newPost = {
                _id: post._id,
                image: post.image,
                textBody: post.textBody,
                username: post.username,
                creationDateTime: post.creationDateTime,
                userId: post.userId,
                isDeleted: post.isDeleted,
                profilePicture: user.profilePicture
            }

            newPosts.push(newPost)

        })

        return res.status(200).send({
            status: 200,
            message: "Posts fetched successfully",
            data: newPosts
        })

    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while fetching data",
            data: err
        })
    }
}

const getFeedPosts = async (req, res) => {

    const myUserId = req.locals.userId;
    const page = Number(req.query.page) || 1;
    const LIMIT = 3;

    let followingList;
    let followingUserIds = [];
    let posts;
    let newPosts = []

    // database calls always goes inside try catch
    try{

        followingList = await Follow.find({currentUserId: myUserId});

        if(followingList.length === 0){
            return res.status(400).send({
                status: 400,
                message: "You are not following anyone!"
            })
        }

        followingList.forEach((followObj) => {
            followingUserIds.push(followObj.followingUserId)
        })

        posts = await Post.find({userId: { $in: followingUserIds}, isDeleted: false}).sort({creationDateTime: -1}).skip((page - 1) * LIMIT).limit(LIMIT)

        


        for (const post of posts) {

            //checking like
            const checkLike = await Like.find({userId: myUserId, postId: post._id})

            let like = false;

            if(checkLike[0]){
                like = true;
            }

            const user = await User.findById(post.userId);

            const newPost = {
                _id: post._id,
                image: post.image,
                textBody: post.textBody,
                username: post.username,
                creationDateTime: post.creationDateTime,
                userId: post.userId,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                isDeleted: post.isDeleted,
                profilePicture: user.profilePicture,
                liked: like
            };

            newPosts.push(newPost);
        }

        return res.status(200).send({
            status: 200,
            message: "Posts fetched successfully",
            data: newPosts
        })



    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while fetching data",
            data: err.message
        })
    }

}

const getSinglePost = async (req, res) => {
    
    const myUserId = req.locals.userId;
    const postId = req.params.postId;

    let post;

    // databse calls always goes inside try catch
    try{

        post = await Post.findById(postId);

        if(!post){
            return res.status(404).send({
                status: 404,
                message: "Post not found"
            })
        }


        return res.status(200).send({
            status: 200,
            message: "Post fetched successfully",
            data: post
        })

    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while fetching data",
            data: err
        })
    }
}

const deletePost = async (req, res) => {
    
    const myUserId = req.locals.userId;
    const postId = req.params.postId;

    let post;

    // databse calls always goes inside try catch
    try{

        post = await Post.findById(postId);

        if(!post){
            return res.status(404).send({
                status: 404,
                message: "Post not found"
            })
        }

        if(post && post.userId!= myUserId){
            return res.status(401).send({
                status: 401,
                message: "You are not authorized to delete this post"
            })
        }

        await Post.findByIdAndUpdate(postId, {isDeleted: true, deletionDateTime: Date.now()})

        return res.status(200).send({
            status: 200,
            message: "Post deleted successfully"
        })

    }
    catch(err){
        return res.status(500).send({
            status: 500,
            message: "Error while fetching data",
            data: err
        })
    }

}










module.exports = {
    createPost,
    getAllMyPosts,
    getFeedPosts,
    getSinglePost,
    deletePost
}