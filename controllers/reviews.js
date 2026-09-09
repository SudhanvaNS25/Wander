// REquire review model & Listing model
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


// Review Submit to DB
module.exports.createReview =  async(req,res)=>{
 let listing=await Listing.findById(req.params.id);
 let newReview=new Review(req.body.review);
 newReview.author=req.user._id;
 listing.reviews.push(newReview);
 await newReview.save();
 await listing.save();
 req.flash("success","Review created");
 res.redirect(`/listings/${listing._id}`);
};

// Delete Review Route
module.exports.deleteReview =  async(req,res)=>{
  let {id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});//DELETING IT FROM THE LISTING ARRAY
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review Deleted");
  res.redirect(`/listings/${id}`)
};