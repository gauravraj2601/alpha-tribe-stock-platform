require("dotenv").config();
const jwt = require('jsonwebtoken');


const authenticator = async (req, res, next) => {
    let token = req?.headers?.authorization.split(" ")[1];
   
    if(!token) {
        throw new Error("Not authorized to access this resource")
    }

    try {
        const isTokenValid = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = isTokenValid;
        console.log(isTokenValid)
        next();
    } catch (error) {
        console.log("Error in Middleware",error.message)
        res.status(401).send({'msg': 'Token is not valid'})
    }
}


module.exports = {authenticator}

