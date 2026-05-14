require("dotenv").config();

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");

require("./config/dbConfig");

const Subscriber = require("./models/Subscriber");

const User = require("./models/User");
const pdfRoutes = require("./routes/pdfRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const { sessionConfig } = require("./config/sessionConfig");

const saveOriginalUrl = require("./middlewares/saveOriginalUrlMiddleware");
const isLoggedIn = require("./middlewares/AuthMiddleware");
const isAdmin = require("./middlewares/AdminMiddleware");
const AsyncWrap = require("./utils/AsyncWrap");

const PORT = 3000;
const app = express();

app.set("trust proxy", 1);
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Basic middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session, cookie, flash
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        { usernameField: "email" },
        User.authenticate()
    )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes------------------------------------------------
app.get("/", (req, res) => {
    res.render("home");
});

app.use("/", AuthRoutes);
app.use("/pdfs", pdfRoutes);
app.use("/admin", AdminRoutes);

app.get("/subscribers", isLoggedIn, isAdmin, AsyncWrap(async (req, res) => {
    const allSubscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });

    res.render("clients/subscriber.ejs", { allSubscribers });
}));

app.post("/subscribers", AsyncWrap(async (req, res) => {
    const { email } = req.body;

    await Subscriber.create({ email });

    req.flash("success", "🎉 You subscribed successfully!");

    res.redirect(req.get("Referrer") || "/");
}));
// Routes------------------------------------------------

// 404
app.use((req, res) => {
    res.status(404).render("404");
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);

    let message = err.message || "Something went wrong!";

    if (err.name === "ValidationError") {
        message = Object.values(err.errors)
            .map(e => e.message)
            .join(", ");
    }

    if (err.name === "CastError") {
        message = "Invalid ID!";
    }

    if (err.code === 11000) {
        message = "Duplicate value exists!";
    }

    req.flash("error", message);
    res.redirect(req.get("Referrer") || "/");
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});