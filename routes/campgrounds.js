var express = require("express");
var router = express.Router();

var Campground = require("../models/campground.js");
var middleware = require("../middleware");


//INDEX-Route displays all campground listings
router.get("/", function(req,res){
    //retrieving all campgrounds from database
    Campground.find({},function(err,campgrounds){
        if(err){
            console.log(err);
        }else{
              //directs to campground listing page
              res.render("campgrounds/index", {campGrounds: campgrounds});  
        }
    })
    
})

//NEW-route displays form for creating a new route
router.get("/new", middleware.isLoggedIn, function(req, res){
    //directs to add Campground page
    res.render("campgrounds/new");
})

//CREATE-route adds a new campground to database
router.post("/", middleware.isLoggedIn, function(req,res){
     //get data from form and add it to campground
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: description, author: author};

    // adding campground to app database
    Campground.create(newCampground,function(err, campground){
        if(err){
            console.log(err);
            req.flash("error", err.message);
        }else{
               //redirect to campgrounds page
                req.flash("success", "Successfully added Campground");
                res.redirect("/campgrounds");
        }    
    })
    
})

//SHOW-route displays info about one campground
router.get("/:id", function(req,res){
    //find campground by Id
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            console.log(err);
            req.flash("error",err.message);
        }else{
            //render show template
            //console.log(campground)
            res.render("campgrounds/show", {campground: campground});
        }
    });
    
    //res.render("show");
})

//EDIT-route edits information for a particular campground
router.get("/:id/edit", middleware.checkCamprgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
            req.flash("error",err.message)
        }
        res.render("campgrounds/edit", {campground: foundCampground});
        })
    })

//UPDATE-route
router.put("/:id", middleware.checkCamprgroundOwnership, function(req,res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            console.log(err)
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        }else{
            req.flash("success", "Successfully edited campground");
            res.redirect("/campgrounds/" + req.params.id)
        }
    } )
})

//DESTROY-route
router.delete("/:id", middleware.checkCamprgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", err.message)
            res.redirect("/campgrounds");
        }else{
            req.flash("error", "You have deleted a campground")
            res.redirect("/campgrounds")
        }
    })
})

module.exports = router;
