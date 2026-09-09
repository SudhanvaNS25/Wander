const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.renderSignUp=(req,res)=>{
    res.render("users/signup.ejs");
};
module.exports.signUp=async(req,res)=>{
    let{username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser= await User.register(newUser,password);
    req.login(registeredUser,((err)=>{
        if(err){
           return  next(err);
        }
        req.flash("sucess","you are logged in");
        res.redirect("/listings");
    }));
};

module.exports.renderLogin=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.Login=async(req,res)=>{
    req.flash("sucess","welcome to wander");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.Logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
           return  next(err);
        }
        req.flash("sucess","you are logged out");
        res.redirect("/listings");
    })
}