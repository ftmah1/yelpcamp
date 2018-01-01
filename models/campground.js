var mongoose = require("mongoose");

//create campground schema
 var campGroundSchema = new mongoose.Schema({
     name: String,
     price: String,
     image: String,
     createdAt: {type: Date, default: Date.now},
     description: String,
     comments:[
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
     ],
     author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    }     
 })
 
 //create model from schema and save it to variable Campground
module.exports = mongoose.model("Campground", campGroundSchema);
