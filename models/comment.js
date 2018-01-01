var mongoose = require("mongoose");

//comment schema
var commentSchema = new mongoose.Schema({
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    createdAt: {type: Date, default: Date.now},
    text: String
})

module.exports = mongoose.model("Comment", commentSchema);