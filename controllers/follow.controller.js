const Follow = require("../models/Follow")
const joi = require('joi');
const User = require('../models/User');

// follow user controller
const followUser = async (req, res) => {
    const currentUserId = req.locals.userId; // taking current user who is logged in through request local storage using authentication middleware
    const followingUserId = req.body.followingUserId; // taking following user to whom the current user has followed (inside http body)

    // validating through joi about the http body data
    const isValid = joi.object({
        followingUserId: joi.string().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }
    
    // finding the following user in the database to whom the current user has followed

    let followingUserData;

    try{

        followingUserData = await User.findById(followingUserId);

        if(!followingUserData){
            return res.status(400).send({
                status: 400,
                message: "Following user not found!"
            })
        }

        // checking whether the user already follows the following user or not

        const checkFollow = await Follow.findOne({currentUserId, followingUserId});

        if(checkFollow){
            return res.status(400).send({
                status: 400,
                message: "You are already following this user!"
            })
        }

        // creating a new follow object if everything is perfect 

        const newFollow = new Follow({
            currentUserId: currentUserId,
            followingUserId: followingUserId,
            creationDateTime: Date.now()
        })

        await newFollow.save(); // saving the follow into database

        return res.status(200).send({
            status: 200,
            message: "Followed user successfully!"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to follow user!",
            data: err.message
        })
    }
}

// unfollow user controller
const unfollowUser = async (req, res) => {

    const currentUserId = req.locals.userId; 
    const unfollowingUserId = req.body.unfollowingUserId; 

    // validating through joi about the http body data
    const isValid = joi.object({
        unfollowingUserId: joi.string().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }
    
    // finding the following user in the database to whom the current user has followed

    let unfollowingUserData;

    try{

        unfollowingUserData = await User.findById(unfollowingUserId);

        if(!unfollowingUserData){
            return res.status(400).send({
                status: 400,
                message: "Following user not found!"
            })
        }

        // checking whether the user already follows the following user or not

        const checkUnfollow = await Follow.findOne({currentUserId: currentUserId, followingUserId: unfollowingUserId});


        if(!checkUnfollow){
            return res.status(400).send({
                status: 400,
                message: "You already not follow this user"
            })
        }

        // deleting the follow object if everything is perfect
        
        await Follow.deleteOne({currentUserId: currentUserId, followingUserId: unfollowingUserId});

        return res.status(200).send({
            status: 200,
            message: "Unfollowed user successfully!"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Failed to unfollow user!",
            data: err
        })
    }
}


module.exports = { followUser, unfollowUser };