const joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const User = require('../models/User')
const Follow = require('../models/Follow')
const Post = require('../models/Post')
const Otp = require('../models/Otp')
const moment = require('moment');
const nodemailer = require("nodemailer");

// check username
const checkUsername = async (req, res) => {

    // used regex expression to validate ubnderscore and space in username
    const isValid = joi.object({
        username: joi.string().pattern(/^[a-zA-Z0-9_ ]+$/).min(3).max(25).required(),
    }).validate(req.body)

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Username can only use letters, numbers, underscores, periods and length must be more than 3.",
            data: isValid.error
        })
    }


    const username = req.body.username;
    
    // database call
    try{

        const user = await User.find({username: username})

        if(user.length!== 0){  //if the username already exist then we send response that username already exists.
            return res.status(400).send({
                status: 400,
                message: `${user[0].username} already exists`
            })
        }
        

        return res.status(200).send({
            status: 200,
            message: "Username available",
            data: username
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }

}

// signup
const signupUser = async (req, res) => {


    // validating data
    const isValid = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        username: joi.string().pattern(/^[a-zA-Z0-9_ ]+$/).min(3).max(25).required(), 
        dob: joi.string().required(),
        password: joi.string().min(6).max(25).required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }

    // calculating age
    const dob = req.body.dob;
    const dobArray = dob.split("-");
    const date = moment();
    const formattedDate = date.format('D-MM-yyyy');
    const currentDateArray = formattedDate.split("-");

    const yearDiff = currentDateArray[2] - dobArray[2];

    let age = 0;

     if(yearDiff >= 16){
 
         age = yearDiff;
 
         if(currentDateArray[1] < dobArray[1]){
             age = age - 1;
         }else if(currentDateArray[1] == dobArray[1]){
             if(currentDateArray[0] < dobArray[0]){
                 age = age - 1;
             }
         }
     }


    // databse call
    try{


        const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS)

        // creating user object from userSchema
        const user = new User({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            age: age,
            dob: req.body.dob, // checked it on frontend side
            password: hashedPassword
        })

        await user.save();
        return res.status(200).send({
            status: 200,
            message: "User registered successfully!"
        })
       

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }

}

// login
const loginUser = async (req, res) => {

    // Data validation
    const isValid = joi.object({
        username: joi.string(),
        email: joi.string().email(),
        password: joi.string().required()
    }).xor('email', 'username').validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid Username or Password",
            data: isValid.error
        })
    }


    let user;

    // fetching data from database
    try{
        user = await User.findOne({$or:[{username: req.body.username}, {email: req.body.email}]})

        if(!user){
            return res.status(400).send({
                status: 400,
                message: "No user found! please register!"
            })
        }

        // if user login then accout is activated again
        if(user.accountDeactivation){
           await User.findByIdAndUpdate(user._id,{accountDeactivation: false})
        }

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching user data",
            data: err
        })
    }

    // checking password if its correct or not
    const isPasswordSame = bcrypt.compare(req.body.password, user.password)

    if(!isPasswordSame){
        return res.status(400).send({
            status: 400,
            message: "Invalid Password"
        })
    }

    const payload = {
        name: user.name,
        username: user.username,
        email: user.email,
        userId: user._id,
    }

    const token = jwt.sign(payload, JWT_SECRET_KEY) // sign is synchronous so no need of await

    return res.status(200).send({
        status: 200,
        message: "Login successful!",
        data: {
            token: token,
        }
    })

}

// get all the users
const getAllUsers = async (req, res) => {
    try{
        const users = await User.find()
        return res.status(200).send({
            status: 200,
            message: "Users fetched successfully!",
            data: users
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }
}

// get searched users
const getSearchedUsers = async (req, res) => {

    const searchedUsername =  req.body.username;

    if(!searchedUsername){
        return res.status(200).send({
            status: 200,
            message: "Users fetched successfully!",
            data: []
        })
    }

    try{


        const allUsers = await User.find();

        const searchedUsers = [];

        // logic to fill the searched user array according to the searched username
        allUsers.forEach((user) => {
            if(user.username.toLowerCase().includes(searchedUsername.toLowerCase())){
                searchedUsers.push(user)
            }
        })
        
        return res.status(200).send({
            status: 200,
            message: "Users fetched successfully!",
            data: searchedUsers
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }
}

// deactivate user account 
const deactivateUser = async (req, res) => {

    const userId = req.locals.userId;

    try{
        await User.findByIdAndUpdate(userId, {accountDeactivation: true})
        
        return res.status(200).send({
            status: 200,
            message: "User deactivated successfully!"
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }
}

// update user details
const updateUserDetails = async (req, res) => { 

    const userId = req.locals.userId;

    // databse calls always goes inside try catch
    try{

        const user = await User.findById(userId);

        const newUser = {
            name: req.body.name || user.name,
            username: req.body.username || user.username,
            email: req.body.email || user.email,
            dob: req.body.dob || user.dob,
            password: req.body.password || user.password,
            bio: req.body.bio || user.bio,
            profilePicture: req.body.profilePicture || user.profilePicture
        }


        const isValid = joi.object({
            name: joi.string(),
            username: joi.string().pattern(/^[a-zA-Z0-9_ ]+$/).min(3).max(25),
            email: joi.string().email(),
            dob: joi.string(),
            password: joi.string().min(6),
            bio: joi.string().min(0),
            profilePicture: joi.string().min(0)
        }).validate(newUser);

        if(isValid.error){
            return res.status(400).send({
                status: 400,
                message: "Invalid input",
                data: isValid.error
            })
        }

        if(user.name !== newUser.name){ // if user changed the name then we have to update it

            await User.findByIdAndUpdate(userId, {name: newUser.name}) // updating name 
    
        }

        if(user.username !== newUser.username){ // if user changed the username then we have to update it

             await User.findByIdAndUpdate(userId, {username: newUser.username}) // updating username
        }

        if(user.email !== newUser.email){ // if user changed the email then we have to update it
            
             await User.findByIdAndUpdate(userId, {email: newUser.email}) // updating email
        } 

        if(user.dob !== newUser.dob){ // if user changed the dob then we have to update

             // calculating age
            const dobArray = newUser.dob.split("-");
            const date = moment();
            const formattedDate = date.format('D-MM-yyyy');
            const currentDateArray = formattedDate.split("-");

            const yearDiff = currentDateArray[2] - dobArray[2];
    

            if(yearDiff < 16){
                return res.status(400).send({
                    status: 400,
                    message: "You must be at least 16 years old to register"
                })
            }else if(yearDiff == 16){
                if(currentDateArray[1] < dobArray[1]){
                    return res.status(400).send({
                        status: 400,
                        message: "You must be at least 16 years old to register"
                    })
                }else if(currentDateArray[1] == dobArray[1]){
                    if(currentDateArray[0] < dobArray[0]){
                        return res.status(400).send({
                            status: 400,
                            message: "You must be at least 16 years old to register"
                        })
                    }
                }
            }

            let newAge;

            if(yearDiff >= 16){

                newAge = yearDiff;

                if(currentDateArray[1] < dobArray[1]){
                    newAge = newAge - 1;
                }else if(currentDateArray[1] == dobArray[1]){
                    if(currentDateArray[0] < dobArray[0]){
                        newAge = newAge - 1;
                    }
                }
            }

             await User.findByIdAndUpdate(userId, {dob: newUser.dob}) // updating dob

             await User.findByIdAndUpdate(userId, {age: newAge}) // updating age

        }

        const isPasswordSame = bcrypt.compare(newUser.password, user.password)

        if(!isPasswordSame){

            const newHashedPassword = await bcrypt.hash(newUser.password,BCRYPT_SALTS)

            await User.findByIdAndUpdate(userId, {password: newHashedPassword}) // updating password
               
        }


        // no need to check for required() on bio and profile pictures as its user's wish to keep it or not

        await User.findByIdAndUpdate(userId, {bio: newUser.bio}); // updating bio
        await User.findByIdAndUpdate(userId, {profilePicture: newUser.profilePicture}); // updating profile picture
    

        // sending response back of successful updation
        return res.status(200).send({
            status: 200,
            message: "User updated successfully!"
        })
        
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }

}

// delete user
const deleteUser = async (req, res) => {

    const userId = req.locals.userId;

    try{

        await User.findByIdAndDelete(userId) // setting is deleted as true which means user id is deleted but not from data base permanentlty and it will be deleted automatically after 30 days with the use of cron util

        return res.status(200).send({
            status: 200,
            message: "User deleted successfully!"
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }

}

const checkEmail = async (req, res) => {

    const email = req.body.email;

     // validating data
     const isValid = joi.object({  
        email: joi.string().email().required(),
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }
    
    try{

        const user = await User.findOne({email: email});

        if(user){
            return res.status(400).send({
                status: 400,
                message: "Email already exists"
            })
        }

        return res.status(200).send({
            status: 200,
            message: "Email available"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }
}

const checkPassword = async (req, res) => {

     // validating data
     const isValid = joi.object({
        password: joi.string().min(6).max(25).required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }

    return res.status(200).send({
        status: 200,
        message: "Password valid"
    })

}

const checkDob = async (req, res) => {

     // validating data
     const isValid = joi.object({
        dob: joi.string().required()
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }

     // calculating age
     const dob = req.body.dob;
     const dobArray = dob.split("-");
     const date = moment();
     const formattedDate = date.format('D-MM-yyyy');
     const currentDateArray = formattedDate.split("-");
 
     const yearDiff = currentDateArray[2] - dobArray[2];
     
 
     if(yearDiff < 16){
         return res.status(400).send({
             status: 400,
             message: "You must be at least 16 years old to register"
         })
     }else if(yearDiff == 16){
         if(currentDateArray[1] < dobArray[1]){
             return res.status(400).send({
                 status: 400,
                 message: "You must be at least 16 years old to register"
             })
         }else if(currentDateArray[1] == dobArray[1]){
             if(currentDateArray[0] < dobArray[0]){
                 return res.status(400).send({
                     status: 400,
                     message: "You must be at least 16 years old to register"
                 })
             }
         }
     }

     let age = 0;

     if(yearDiff >= 16){
 
         age = yearDiff;
 
         if(currentDateArray[1] < dobArray[1]){
             age = age - 1;
         }else if(currentDateArray[1] == dobArray[1]){
             if(currentDateArray[0] < dobArray[0]){
                 age = age - 1;
             }
         }
     }
 
     return res.status(200).send({
         status: 200,
         message: "Date of birth valid",
         data: {age}
     })

}

const generateOtp = async (req, res) => {

    const email = req.body.email;

    

    try{

        
        const otp = Math.floor(100000 + Math.random() * 900000);


        const oldOtp = await Otp.find({email})


        // if email with otp already exist then we just update otp else we create new object of otp and email and store it in database
        if(oldOtp[0]){

            await Otp.findByIdAndUpdate(oldOtp[0]._id, {otp})

        }else{

            const otpobj = new Otp({
                email: email,
                otp: otp
            })
    
            await otpobj.save();

        }

       
        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'allyallofficial@gmail.com',
            pass: 'shohrqguygcasxcq',
            },
        });

        const mailOptions = {
            from: 'allyallofficial@gmail.com',
            to: email,
            subject: `${otp} is your AllyAll code`,
            text: `Hi, Someone tried to sign up for an AllyAll account with ${email}. if it was you, enter this confirmation code in the app: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            //console.error(error);
            res.status(500).send({
                status: 500,
                message: "Error while sending OTP"
            });
            } else {
           // console.log('Email sent: ' + info.response);
            res.status(200).send({
                status: 200,
                message: "OTP sent successfully"
            });
            }
        });

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err
        })
    }
    

}

const checkOtp = async (req, res) => {
    const otp = req.body.otp;
    const email = req.body.email;

    try{

        const checkOtp = await Otp.find({otp});

        if(!checkOtp[0]){
            return res.status(400).send({
                status: 400,
                message: "Invalid OTP"
            })
        }

        if(checkOtp[0].email !== email){
            return res.status(400).send({
                status: 400,
                message: "Invalid OTP"
            })
        }

        return res.status(200).send({
            status: 200,
            message: "OTP verified successfully"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }

}

const verifyOtp = async (req, res) => {

    const otp = req.body.otp;
    const email = req.body.email;

    try{

        const checkOtp = await Otp.find({otp});

        console.log(checkOtp[0])
        if(!checkOtp[0]){
            return res.status(400).send({
                status: 400,
                message: "Invalid OTP"
            })
        }

        if(checkOtp[0].email !== email){
            return res.status(400).send({
                status: 400,
                message: "Invalid OTP"
            })
        }

        await Otp.findByIdAndDelete(checkOtp[0]._id);

        return res.status(200).send({
            status: 200,
            message: "OTP verified successfully"
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }

}

const getLoggedInUser = async (req, res) => {

    const myUserId = req.locals.userId;

    try{
        const user = await User.findById(myUserId);

        const loggedInUser = {
            _id: user._id,
            username: user.username,
            bio: user.bio,
            email: user.email,
            name: user.name,
            dob: user.dob,
            accountDeactivation: user.accountDeactivation,
            profilePicture: user.profilePicture,
            creationDateTime: user.creationDateTime,
        }

        return res.status(200).send({
            status: 200,
            message: "User details fetched successfully",
            data: loggedInUser
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }
}

const checkProfileAndReturnUserDetails = async (req, res) => {

    const isValid = joi.object({
        profileUserId: joi.string().required()
    }).validate(req.body)

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }

    const myUserId = req.locals.userId;

    const profileUserId = req.body.profileUserId;

    // accessing database 
    try{

        const user = await User.findById(profileUserId);

        const following = await Follow.find({currentUserId: myUserId, followingUserId: profileUserId})

        let follow = false;

        if(following.length > 0){
            follow = true;
        }

        // profile details

        let profileUserFollowersList = await Follow.find({followingUserId: profileUserId})

        let profileUserFollowingList = await Follow.find({currentUserId: profileUserId})

        let profileUserPosts = await Post.find({userId: profileUserId})

        // checking if the user clicked on his profile then we return loggedinUser as true else we return it as false
        if(myUserId == profileUserId){

            const loggedInUser = {
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                dob: user.dob,
                profilePicture: user.profilePicture,
                creationDateTime: user.creationDateTime,
                bio: user.bio,
                age: user.age,
                accountDeactivation: user.accountDeactivation,
                loggedInUser: true,
                profileUserFollowersList,
                profileUserFollowingList,
                profileUserPosts
            }

            return res.status(200).send({
                status: 200,
                message: "User Found!",
                data: loggedInUser
            })
        }

        const otherUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            dob: user.dob,
            profilePicture: user.profilePicture,
            creationDateTime: user.creationDateTime,
            bio: user.bio,
            age: user.age,
            accountDeactivation: user.accountDeactivation,
            loggedInUser: false,
            following: follow,
            profileUserFollowersList,
            profileUserFollowingList,
            profileUserPosts
        }

        return res.status(200).send({
            status: 200,
            message: "User Found!",
            data: otherUser
        })

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }

}

const updatePreviouslyClickedUserId = async (req, res) => {
    
    const myUserId = req.locals.userId;

    const previouslyClickedUserId = req.body.previouslyClickedUserId;

    const isValid = joi.object({
        previouslyClickedUserId: joi.string().required()
    }).validate(req.body)

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "invalid input",
            data: isValid.error
        })
    }

    try{

        await User.findByIdAndUpdate(myUserId, {previouslyClickedUserId})

        return res.status(200).send({
            status: 200,
            message: "User details updated successfully",
            data: previouslyClickedUserId
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }

}

const getPreviouslyClickedUserId = async ( req, res ) => {
    
    const myUserId = req.locals.userId;

    try{

        const user = await User.findById(myUserId);

        return res.status(200).send({
            status: 200,
            message: "User details fetched successfully",
            data: user.previouslyClickedUserId
        })
    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching data",
            data: err.message
        })
    }
}

const refresh = async (req, res) => {

    try{

        const users = await User.find();

        return res.status(200).send()
    }
    catch(err){
        return res.status(400).send()
    }

}




module.exports = {
    checkUsername,
    signupUser,
    loginUser,
    getAllUsers,
    getSearchedUsers,
    deactivateUser,
    updateUserDetails,
    deleteUser,
    checkEmail,
    checkPassword,
    checkDob,
    generateOtp,
    checkOtp,
    verifyOtp,
    checkProfileAndReturnUserDetails,
    getLoggedInUser,
    updatePreviouslyClickedUserId,
    getPreviouslyClickedUserId,
    refresh
}






