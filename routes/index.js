var express = require("express");
var router = express.Router();
var passport = require("passport")

var User = require("../models/user.js");

//====================
// AUTHCATE ROUTES
//====================

//show sign up form
router.get("/register", function(req, res) {
    res.render("register");
})

//handle signup logic
router.post("/register",function(req, res) {
    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register");
        }else{
            passport.authenticate("localStrategy")(req,res,function(){
                req.flash("success", "Welcome to YelpCamp" + " " +user.username)
                res.redirect("/campgrounds");
            })
        }
    })
})

//show login form
router.get("/login", function(req, res) {
    res.render("login");
})

//handle login logic
router.post("/login", passport.authenticate("local",{
        successRedirect: "/campgrounds",
        failureRedirect: "/login" 
    }), function(req,res){
        req.flash("success", "You have logged in");
})

//handle logout logic
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "U logged out!!");
    res.redirect("/campgrounds");
})

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}

module.exports =router;