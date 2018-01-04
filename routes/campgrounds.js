var express = require("express");
var router = express.Router();
var request = require("request");


var Campground = require("../models/campground.js");
var middleware = require("../middleware");
var geocoder   = require("geocoder");

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dzo2txjkn', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX-Route displays all campground listings
router.get("/", function(req,res){
    if(req.query.search){
        const regex = RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex},function(err,campgrounds){
            if(err){
                console.log(err);
            }else{
                  //directs to campground listing page
                  res.render("campgrounds/index", {campGrounds: campgrounds});  
            }
        });
    }else{
        //retrieving all campgrounds from database
        Campground.find({},function(err,campgrounds){
            if(err){
                console.log(err);
            }else{
                  //directs to campground listing page
                  res.render("campgrounds/index", {campGrounds: campgrounds, page:"campgrounds"});  
            }
        }) ;       
    }

    
});

//NEW-route displays form for creating a new route
router.get("/new", middleware.isLoggedIn, function(req, res){
    //directs to add Campground page
    res.render("campgrounds/new");
})

//CREATE-route adds a new campground to database
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});

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
