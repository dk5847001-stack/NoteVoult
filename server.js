require("dotenv").config();
const express = require("express");
require("./config/dbConfig");
const methodOverride = require("method-override");
const multer = require('multer')
const { storage } = require("./config/cloudConfig");
const pdfRoutes = require("./routes/pdfRoutes");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const { sessionConfig } = require("./config/sessionConfig");
const flash = require("connect-flash");
const path = require("path");
const ejsMate = require("ejs-mate")
const PORT = 3000;
const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// =================== Routes =====================
app.get("/", (req, res) => {
    res.render("home");
});
app.use("/pdfs", pdfRoutes);

app.use((req, res, next)=>{
    res.status(404).render("404")
})
// =================== Routes =====================

// ================== Global Middleware Handle =================
app.use((err, req, res, next) => {
    console.error(err);

    let status = err.status || 500;
    let message = err.message || "Something went wrong!";

    // Mongoose Validation
    if (err.name === "ValidationError") {
        message = Object.values(err.errors)
            .map(e => e.message)
            .join(", ");
        status = 400;
    }

    // Cast Error (invalid id)
    if (err.name === "CastError") {
        message = "Invalid ID!";
        status = 400;
    }

    // Duplicate key
    if (err.code === 11000) {
        message = "Duplicate value exists!";
        status = 409;
    }

    // 👉 IMPORTANT: flash + redirect
    req.flash("error", message);

    // 👉 where to redirect?
    console.log(req.get("Referrer"));
    res.redirect(req.get("Referrer") || "/users");
});

app.listen(PORT, () => {
    console.log(`✅ The server is runing on localhost:${PORT}`);
})