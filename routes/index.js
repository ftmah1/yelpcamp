var express = require("express");
var router = express.Router();
var passport = require("passport");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require('crypto');



var User        = require("../models/user.js"),
    Campground  = require("../models/campground.js");

//====================
// AUTHCATE ROUTES
//====================

//show sign up form
router.get("/register", function(req, res) {
    res.render("register", {page:'register'});
});

//handle signup logic
router.post("/register",function(req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    });
    //eval(require("locus"));
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register", {error: err.message});
        }else{
            passport.authenticate("localStrategy")(req,res,function(){
                req.flash("success", "Welcome to YelpCamp" + " " +user.username);
                res.redirect("/campgrounds");
            });
        }
    });
});

//show login form
router.get("/login", function(req, res) {
    res.render("login", {page:"login"});
});

//handle login logic
router.post("/login", passport.authenticate("local",{
        successRedirect: "/campgrounds",
        failureRedirect: "/login" 
    }), function(req,res){
        req.flash("success", "You have logged in");
});

//handle logout logic
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "U logged out!!");
    res.redirect("/campgrounds");
});

//User Profile
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
      if(err){
          console.log(err);
          req.flash("error", "user not found");
          res.redirect("/");
      }else{
          Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
              if(err){
                  console.log(err);
                  req.flash("error", "something went wrong");
                  res.redirect("/");
             }else{
                   res.render("users/show", {user: foundUser , campgrounds: campgrounds});
             }          
          });
      }  
    });
});

//forgot route
router.get("/forgot", function(req, res) {
    res.render("forgot");
});

router.post("/forgot", function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err,buf){
                if(err){
                    console.log(err);
                    res.redirect('/forgot');
                }else{
                   var token = buf.toString('hex');
                   done(err, token);
                }
            });
        },
        function(token, done){
          User.findOne({email: req.body.email}, function(err, user){
              if(err){
                  console.log(err);
                  req.flash('error', 'Sorry something went wrong! Try again');
                  return res.redirect('/forgot');
              }else{
                  user.resetPasswordToken = token;
                  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                  
                  user.save(function(err){
                      if(err){
                          console.log(err);
                          req.flash('error', 'Sorry something went wrong! Try again');
                          return res.redirect('/forgot');
                      }else{
                          done(err, token, user);
                      }
                  });
              }
          }); 
        },
        function(token, user, done){
          var smtpTransport = nodemailer.createTransport({
             service: 'Gmail',
             auth:{
               user: 'learnwithtanwir@gmail.com',
               pass: process.env.GMAILPW
             }
          });
          var mailOptions= {
            to: user.email,
            from: 'learnwithtanwir',
            subject: 'BDcamps Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + 'webbootcamp-tanwirmahfuz.c9users.io' + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err){
              if(err){
                  console.log(err);
              }else{
                  console.log('mail sent');
                  req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.' );
                  done(err, 'done');
              }
          });
        }
    ], function(err){
        if(err) return next (err);
        res.redirect('/forgot');
    });
});

//RESET ROUTE
router.get("/reset/:token", function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() } }, function(err, user){
        if(err){
            console.log(err);
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }else{
            res.render('reset', {token: req.params.token});
        }
    });
});

router.post("/reset/:token", function(req, res) {
    async.waterfall([
        function(done){
          User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() } }, function(err, user) {
              if(err){
                  req.flash('error', 'Password reset token is invalid or has expired.');
                  return res.redirect('back');
              }else{
                  if(req.body.password === req.body.confirm){
                      user.setPassword(req.body.password, function(err){
                          if(err){
                              console.log(err);
                              req.flash('error', 'passowrds do not match');
                              return res.redirect('back');
                          }else{
                             user.resetPasswordToken = undefined;
                             user.resetPasswordExpires = undefined;
                              
                             user.save(function(err){
                                 if(err){
                                   console.log(err);
                                   return res.redirect('back');
                                 }else{
                                     req.logIn(user, function(err){
                                        if(err){
                                            console.log(err);
                                            return res.redirect('/forgot');
                                        }else{
                                            done(err, user);
                                        } 
                                     });
                                 }
                             }); 
                          }
                      });
                  }else{
                      req.flash("error", "Passwords do not match.");
                      return res.redirect('back');
                  }
              }
          })  
        },
        function(user, done){
            var smtpTransport = nodemailer.createTransport({
               service: "Gmail",
               auth: {
                 user: 'learnwithtanwir',
                 pass: process.env.GMAILPW
               }
            });
            var mailOptions = {
                to: user.email,
                from: 'learnwithtanwir@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                if(err){
                    console.log(err);
                    req.flash('error', 'Please try again');
                    return res.redirect('/forgot');
                }else{
                   req.flash('success', 'Success! Your password has been changed.');
                   done(err);
                }
            });
                  
        },
    ], function(err){
        if(err){
            console.log(err);
        }else{
          res.redirect('/campgrounds');  
        }
    });
});


//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}

module.exports =router;