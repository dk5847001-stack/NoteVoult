require("dotenv").config();
const express = require("express");
const Pdf = require("./models/pdf")
require("./config/dbConfig");
const methodOverride = require("method-override");
const multer = require('multer')
const { storage } = require("./config/cloudConfig");
const pdfRoutes = require("./routes/pdfRoutes");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const User = require("./models/User");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { sessionConfig } = require("./config/sessionConfig");
const flash = require("connect-flash");
const LoginActivity = require("./models/LoginActivity");
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const { v4: uuidv4 } = require('uuid');
const path = require("path");
const ejsMate = require("ejs-mate")
const PORT = 3000;
const app = express();
app.set("trust proxy", 1);
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.use(session(sessionConfig));
app.use(flash());
app.use(cookieParser());


// passport initialize-----------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(
        {
            usernameField: "email"
        },
        User.authenticate()
    )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Auth middleware----------------------------
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        if (req.method === "GET") {
            req.session.originalUrl = req.originalUrl;
        }

        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }

    next();
}

// Save original url----------------------------
function saveOriginalUrl(req, res, next) {
    if (req.session.originalUrl) {
        res.locals.originalUrl = req.session.originalUrl;
    }

    next();
}

// Owner check middleware-----------------------
async function isOwner(req, res, next) {
    const { id } = req.params;

    const pdf = await Pdf.findById(id);

    if (!pdf) {
        req.flash("error", "PDF not found!");
        return res.redirect("/pdfs");
    }

    if (!req.user) {
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }

    if (!pdf.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect("/pdfs");
    }

    next();
}

// Admin check middleware----------------------
function isAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }

    if (req.user.role !== "admin") {
        req.flash("error", "You don't have admin permission!");
        return res.redirect("/pdfs");
    }

    next();
}

// =================== Routes =====================
app.get("/", (req, res) => {
    res.render("home");
});
app.use("/pdfs", pdfRoutes);

// ------------Admin Routes --------------
app.get("/admin", isAdmin, async (req, res) => {
    const users = await User.find({});
    res.render("clients/adminDeshboard.ejs", { users });
});

app.get("/admin/user/:id", isAdmin, async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    const logs = await LoginActivity.find({ user_id: id })
        .sort({ login_time: -1 });

    res.render("clients/userDetails.ejs", {
        user,
        logs
    });
});

// ------------------------ Auth Routes ---------------
app.get("/register", (req, res) => {
    res.render("clients/register.ejs");
});
app.get("/login", (req, res) => {
    res.render("clients/login.ejs");
});
app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/");
        };
        req.flash("success", "Logged out successfully!");
        res.redirect("/login");
    });
});
app.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        // auto login
        req.login(registeredUser, (err) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("/register");
            }

            req.flash("success", "Account created successfully!");
            return res.redirect("/pdfs");
        });

    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("/register");
    }
});

// login route----------
app.post("/login",
    saveOriginalUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    async (req, res) => {

        // ================= DEVICE TRACKING =================

        const UAParser = require("ua-parser-js");
        const axios = require("axios");
        const { v4: uuidv4 } = require("uuid");

        // ✅ 1. User-Agent parse
        const userAgent = req.headers['user-agent'];
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        let device = "Desktop";

        // ✅ Exact model if available
        if (result.device.vendor && result.device.model) {
            device = `${result.device.vendor} ${result.device.model}`;
        }

        // 🔥 Manual extraction (IMPORTANT)
        else {
            const ua = userAgent.toLowerCase();

            // iPhone
            if (/iphone/.test(ua)) {
                device = "iPhone";
            }

            // Samsung (SM-XXXX detect)
            else if (/sm-[a-z0-9]+/.test(ua)) {
                const match = ua.match(/sm-[a-z0-9]+/);
                device = `Samsung ${match[0].toUpperCase()}`;
            }

            // Xiaomi / Redmi / Poco
            else if (/redmi|mi\s|poco/.test(ua)) {
                const match = ua.match(/(redmi|mi|poco)[\s\-]?[a-z0-9]+/);
                device = match ? match[0].toUpperCase() : "Xiaomi Device";
            }

            // Oppo
            else if (/oppo/.test(ua)) {
                device = "Oppo Device";
            }

            // Vivo
            else if (/vivo/.test(ua)) {
                device = "Vivo Device";
            }

            // Nothing
            else if (/nothing/.test(ua)) {
                device = "Nothing Phone";
            }

            // Tablet
            else if (result.device.type === "tablet") {
                device = "Tablet";
            }

            // Mobile fallback
            else if (result.device.type === "mobile") {
                device = "Android Mobile";
            }
        }

        // Browser + OS
        const browser = parser.getBrowser().name || "Unknown";
        const os = parser.getOS().name || "Unknown";

        // ✅ 2. IP
        let ip = req.headers['x-forwarded-for']?.split(',')[0]
            || req.socket.remoteAddress;

        // 🔥 Fix localhost issue
        if (ip === "::1" || ip === "127.0.0.1") {
            ip = "8.8.8.8"; // test IP (Google)
        }

        console.log("User IP:", ip);

        // ✅ 3. Location
        let location = "Unknown";

        try {
            const response = await axios.get(`https://ipapi.co/${ip}/json`);

            const data = response.data;

            location = [
                data.city,
                data.region,
                data.country_name,
                data.postal
            ].filter(Boolean).join(", ");

        } catch (err) {
            console.log("Location error:", err.message);
        }

        // ✅ 4. Device ID
        let device_id = req.cookies.device_id;

        if (!device_id) {
            device_id = uuidv4();
            res.cookie("device_id", device_id, {
                maxAge: 1000 * 60 * 60 * 24 * 365
            });
        }

        // ✅ 5. Save
        await LoginActivity.create({
            user_id: req.user._id,
            device,
            browser,
            os,
            ip,
            location,
            device_id
        });

        // ================= NORMAL LOGIN =================

        const redirectUrl = res.locals.originalUrl || "/pdfs";
        req.session.originalUrl = null;

        req.flash("success", `welcome back, ${req.user.username}`);
        res.redirect(redirectUrl);
    }
);

app.use((req, res, next) => {
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