require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticator = async (req, res, next) => {
  let token;

  if (req.headers && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const isTokenValid = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = isTokenValid;
    console.log(isTokenValid);
    next();
  } catch (error) {
    console.log("Error in Middleware", error.message);
    res.status(401).send({ msg: "Token is not valid" });
  }
};

module.exports = { authenticator };
