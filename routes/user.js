const express = require('express')
const { isAuth } = require('../middlewares/AuthMiddleware')
const { 
    signupUser,
    loginUser, 
    checkUsername,
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
    updatePreviouslyClickedUserId ,
    getPreviouslyClickedUserId
} = require('../controllers/user.controller');

const app = express();

// check username
app.post('/check-username', checkUsername);

// signup user
app.post('/signup', signupUser);

// login user
app.post('/login', loginUser);

// get all users
app.get('/get-all-users', isAuth, getAllUsers);

// get searched users
app.post('/get-searched-users', isAuth, getSearchedUsers);

// deactivate user
app.patch('/deactivate-user', isAuth, deactivateUser);

// update user details 
app.put('/update-user', isAuth, updateUserDetails);

// delete user
app.delete('/delete-user', isAuth, deleteUser);

//checkemail
app.post('/checkemail', checkEmail);

//checkpassword
app.post('/checkpassword', checkPassword);

//checkdob
app.post('/checkdob', checkDob);

//generate otp
app.post('/generateotp', generateOtp);

//check otp

app.post('/checkotp', checkOtp);

//verify otp
app.post('/verifyotp', verifyOtp);

// get logged in user
app.get('/get-logged-in-user', isAuth, getLoggedInUser);

// checking profile and returning the modified user details 
app.post('/check-profile', isAuth, checkProfileAndReturnUserDetails)

// updatePriviouslyClickedUserid
app.patch('/update-previously-clicked-userId', isAuth, updatePreviouslyClickedUserId);

// getPriviouslyClickedUserId
app.get('/get-previously-clicked-userId', isAuth, getPreviouslyClickedUserId);

module.exports = app;