//configuring app
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var passport = require("passport");
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
var flash = require("connect-flash")


var Campground = require("./models/campground.js");
var Comment    = require("./models/comment.js")
var User = require("./models/user.js");
var seedDB = require("./seedDB");

var campgroundRoutes = require("./routes/campgrounds.js"),
    commentRoutes    = require("./routes/comments.js"),
    indexRoutes      =require("./routes/index.js");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//configuring mongose
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//connecting to app database
mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});
//mongoose.connect("mongodb://tanwir:nic@ds133077.mlab.com:33077/yelpcamp");


//Passport config
app.use(require("express-session")({
    secret: "fluff",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

app.use(indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

//running the seed file
//seedDB();

//dummy campground variable
/*var campGrounds = [
    {name: "Salmon Creek", image: "https://farm6.staticflickr.com/5187/5623797406_ea91016ac3.jpg"},
    {name: "Granite Hall", image: "https://farm9.staticflickr.com/8161/7360193870_cc7945dfea.jpg"},
    {name: "Mountain Goat's rest", image: "https://farm9.staticflickr.com/8577/16263386718_c019b13f77.jpg"},
     {name: "Salmon Creek", image: "https://farm6.staticflickr.com/5187/5623797406_ea91016ac3.jpg"},
    {name: "Granite Hall", image: "https://farm9.staticflickr.com/8161/7360193870_cc7945dfea.jpg"},
    {name: "Mountain Goat's rest", image: "https://farm9.staticflickr.com/8577/16263386718_c019b13f77.jpg"},
     {name: "Salmon Creek", image: "https://farm6.staticflickr.com/5187/5623797406_ea91016ac3.jpg"},
    {name: "Granite Hall", image: "https://farm9.staticflickr.com/8161/7360193870_cc7945dfea.jpg"},
    {name: "Mountain Goat's rest", image: "https://farm9.staticflickr.com/8577/16263386718_c019b13f77.jpg"},
     {name: "Salmon Creek", image: "https://farm6.staticflickr.com/5187/5623797406_ea91016ac3.jpg"},
    {name: "Granite Hall", image: "https://farm9.staticflickr.com/8161/7360193870_cc7945dfea.jpg"},
    {name: "Mountain Goat's rest", image: "https://farm9.staticflickr.com/8577/16263386718_c019b13f77.jpg"}
 ];*/
 
    /*Campground.create({
        name: "Salmon Creek",
        image: "https://farm6.staticflickr.com/5187/5623797406_ea91016ac3.jpg",
        description: "Its just salmon"
    },function(err, campground){
        if(err){
            console.log(err)
        }else{
               //redirect to campgrounds page
                console.log(campground);
        }    
    })*/

app.get("/", function(req,res){
    //directs to home page
    res.render("landing");
})


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelp Camp server started");
})
