const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    username: {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    bio : {
        type : String,
        default : ""
    },
    profilePicture : {
        type : String,
        default : ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}
)

const User_Model = mongoose.model("User", UserSchema)


module.exports = {User_Model}

