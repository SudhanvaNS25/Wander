if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
const express=require("express");
const app=express();
const mongoose=require("mongoose");;
// const MONGO_URL="mongodb://127.0.0.1:27017/Wander";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const expressError=require("./utils/expressError");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRoute=require("./routes/user.js");
const session=require("express-session");//Create a session middleware with the given options.
const { MongoStore } = require("connect-mongo");
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

let dbUrl = process.env.ATLAS_URL;

main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs', ejsMate);// use ejs-locals for all ejs templates:

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60, // 1 day (in seconds)
});
store.on("error", function (e) {
  console.log("SESSION STORE ERROR:", e);
});
// app.get("/",(req,res)=>{
//     res.send("i am workig");
// });

const sessionOption={
    store,
secret:"mysupersecretstring",
resave:false,
saveUninitialized:true,
cookie:{
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge:7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
},
}; 



app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/",userRoute);
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews", reviewRouter);




// app.get("/testListing",async(req,res)=>{
//     let sampleListing= new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location:"goa",
//         country:"india",
//     });
//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("sucessful testing")
// });
app.all("/{*splat}",(req,res,next)=>{
  next(new expressError(404,"page not found"));
});

//middlewear
app.use((err,req,res,next) =>{
    let {status = 500 , message = "Somthing went Wrong"} = err;
    res.status(status).render("error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("serever is listening to port 8080");
});