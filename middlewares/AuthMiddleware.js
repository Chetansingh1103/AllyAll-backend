const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const isAuth = (req, res, next) => {

    const token = req.headers["xs-my-app"]

    let verified;

    try{

        verified = jwt.verify(token,JWT_SECRET_KEY) // if verified is true then the logged in users payload will be verified's value 

    }
    catch(err){
        return res.status(400).send({
            status: 400,
            message: "JWT not provided! Please Login",
            data: err
        })
    }

    if(verified){
        req.locals = verified; // every api call has its own locals and it will vanish when the response is sent back
        next();
    }else{
        return res.status(401).send({
            status: 401,
            message: "User not authenticated! Please login!"
        })
    }

}

module.exports = {isAuth};