const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const saveOriginalUrl = require("../middlewares/saveOriginalUrlMiddleware");
const passport = require("passport");

router.get("/register", AuthController.renderRegisterForm);
router.get("/login", AuthController.renderLoginForm);
router.get("/logout", AuthController.logoutUser);
router.post("/register", AuthController.registerUser);

// login route----------
router.post("/login",
    saveOriginalUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    AuthController.loginUser);

module.exports = router;