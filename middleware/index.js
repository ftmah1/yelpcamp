var Campground = require("../models/campground.js"),
    Comment    = require("../models/comment.js");
    
var middlewareObj = {};
 
middlewareObj.checkCamprgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                console.log(err);
                res.redirect("back");
            }else{
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                }else{
                    res.redirect("back")
                }                
            }

        })
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                console.log(err);
                req.flash("error", " Campground not found ");
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id)){ //req.user._id is the current logged in user
                    next();
                }else{
                    req.flash("error", " Permission denied ");
                    res.redirect("back")
                }                
            }

        })
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "You need to be logged in!");
        res.redirect("/login");
    }
}

module.exports = middlewareObj
