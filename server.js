require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
require("./config/dbConfig");
const Pdf = require("./models/pdf");
const methodOverride = require("method-override");
const multer = require('multer')
const { storage } = require("./config/cloudConfig");
const upload = multer({ storage });
const cloudinary = require("./config/cloudConfig").cloudinary;
const pdfRoutes = require("./routes/pdfRoutes");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const sessionConfig = require("./config/sessionConfig");
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


app.listen(PORT, () => {
    console.log(`✅ The server is runing on localhost:${PORT}`);
})