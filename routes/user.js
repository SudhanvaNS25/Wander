const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
// Require Controller
const UserController = require("../controllers/users.js");


router.route("/signup")
.get(UserController.renderSignUp)
.post(wrapAsync(UserController.signUp));

router.route("/login")
.get(UserController.renderLogin)
.post(saveRedirectUrl,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true,
}),UserController.Login
);


router.get("/logout",UserController.Logout);


module.exports = router;