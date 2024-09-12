const mongoose = require("mongoose");

const Post_Schema = mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    stockSymbol : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    tags : [{
        type: String
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment' 
    }],
    likes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Post_Model = mongoose.model("Post", Post_Schema)


module.exports = {Post_Model}



