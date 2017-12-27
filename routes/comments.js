var express = require("express");
var router = express.Router({mergeParams: true});

var Campground = require("../models/campground.js");
var Comment = require("../models/comment.js");
var middleware = require("../middleware");

// ==================
// Comments route
// ==================

//NEW-route 
router.get("/new", middleware.isLoggedIn, function(req,res){
      Campground.findById(req.params.id, function(err,campground){
          if(err){
              console.log(err);
              req.flash("err", err.message)
          }else{
              res.render("comments/new", {campground: campground, currentUser: req.user});
          }
      })
})

//CREATE- route
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err)
        }else{
           // console.log(req.body.comment);
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err)
                }else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    //add comment to camprgorund
                    campground.comments.push(comment);
                    //save campground
                    campground.save();
                    //console.log(comment);
                    res.redirect("/campgrounds/" + campground._id);
                }
            })
        }
    })
})

//EDIT-ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
     //res.send("Edit route");
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back");
        }else{
            //console.log(foundComment)
            res.render("comments/edit", {campground_id: req.params.id ,comment: foundComment})
        }
    })    
})

//UPDATE-ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect("back")
        }else{
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
})

//DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    //res.send("delete route");
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
})

module.exports = router;