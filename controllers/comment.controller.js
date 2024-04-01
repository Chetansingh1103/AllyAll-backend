const Comment = require("../models/Comment")
const joi = require('joi');

const createComment = async (req, res) => {

    const myUserId = req.locals.userId;
    const myUsername = req.locals.username;

    const isValid = joi.object({
        comment: joi.string().required(),
        postId: joi.string().required(),
        commentId: joi.string()
    }).validate(req.body)

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid input",
            data: isValid.error
        })
    }

    let commentId = req.body.commentId;

    if(!commentId){

        commentId = ""

    }

    try{

        const comment = new Comment({
            comment: req.body.comment,
            userId: myUserId,
            username: myUsername,
            postId: req.body.postId,
            commentId: commentId
        })

        await comment.save()

        return res.status(200).send({
            status: 200,
            message: "Comment created successfully",
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Invalid input",
            data: err.message
        })
    }

}

const getPostComments = async (req, res) => {

    const myUserId = req.locals.userId;

    const postId = req.params.postId
    

    try{

        const comments = await Comment.find({postId: postId, commentId: ""})

        return res.status(200).send({
            status: 200,
            message: "Comments fetched successfully",
            data: comments
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Invalid input",
            data: err.message
        })
    }

}

const getCommentReplies = async (req, res) => {
    
    const myUserId = req.locals.userId;

    const commentId = req.params.commentId

    try{
        
        const replies = await Comment.find({commentId: commentId})

        return res.status(200).send({
            status: 200,
            message: "Replies fetched successfully",
            data: replies
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Invalid input",
            data: err.message
        })
    }
}

module.exports = { createComment, getPostComments, getCommentReplies }