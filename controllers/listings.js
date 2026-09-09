const Listing=require("../models/listing.js");

module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm= (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.edit=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
   if(!listing){
    req.flash("error","Listing you requested does not exist");
   return res.redirect("/listings");
  }
    let orgImgUrl = listing.image.url;  
    orgImgUrl = orgImgUrl.replace("/upload" , "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing,orgImgUrl });
};

module.exports.show=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author",}}).populate("owner");
  if(!listing){
    req.flash("error","Listing you requested does not exist");
   return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.newPost= async (req, res,next) => {
      let url = req.file.path;
      let filename = req.file.filename;
       const newListing = new Listing(req.body.listing);
       newListing.owner=req.user._id;
      newListing.image = {url , filename};
       await newListing.save();
       req.flash("success","newListing created");
       res.redirect("/listings");
};

module.exports.filterCategory = async (req, res) => {
    const { category } = req.params;
    const allListings = await Listing.find({ category });
    res.render("listings/index.ejs", {
        allListings,
        category
    });
};
module.exports.searchListings = async (req,res) =>{
    let {q} = req.query;

    // If user did't enter something in search bar n click search
    if(!q || q.trim()===""){
        req.flash("error" , "Please type something in search Bar");
        return res.redirect("/listings");
    }

    // Case Sensitive to deal karre hai yaha pe
    let regex = new RegExp(q , "i"); // "i" for case insensitive
    let lists = await Listing.find({
        $or: [
            {title : regex},
            {category : regex},
            {location : regex},
            {country : regex},
        ],
    });

    if(lists.length === 0){
        req.flash("error" , `No result found for ${q}`);
        return res.redirect("/listings");
    };

        res.render("listings/index.ejs", {
        allListings:lists
    });
};

module.exports.update= async (req, res) => {
  let { id } = req.params;
  let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file !=="undefined"){
  let url = req.file.path;
   let filename = req.file.filename;
   listing.image = {url , filename};
   await listing.save();
  }
  req.flash("sucess","listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.delete=async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing Deleted");
  res.redirect("/listings");
};