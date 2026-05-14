const AsyncWrap = require("../utils/AsyncWrap");
const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");
const UAParser = require("ua-parser-js");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

module.exports.renderRegisterForm = AsyncWrap((req, res) => {
    res.render("clients/register2.ejs");
});

module.exports.renderLoginForm = AsyncWrap((req, res) => {
    res.render("clients/login.ejs");
});

module.exports.logoutUser = AsyncWrap((req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/");
        };
        req.flash("success", "Logged out successfully!");
        res.redirect("/login");
    });
});

module.exports.registerUser = AsyncWrap(async (req, res) => {
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

module.exports.loginUser = AsyncWrap(async (req, res) => {

        // ===== user status check? ========
        if (req.user.isBlocked === "blocked") {
            req.logout((err) => {
                if (err) {
                    req.flash("error", "Something went wrong!");
                    return res.redirect("/login");
                }

                req.flash("error", "Sorry! you're 🚫 blocked by admin, please contact admin");
                return res.redirect("/login");
            });

            return;
        }

        // ================= DEVICE TRACKING =================

        // ✅ 1. User-Agent parse
        const userAgent = req.headers['user-agent'];
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        let device = "Desktop";

        // 🔥 1. Exact vendor + model (best case)
        if (result.device.vendor && result.device.model) {
            device = `${result.device.vendor} ${result.device.model}`;
        }

        // 🔥 2. iPhone detect
        else if (/iphone/i.test(userAgent)) {
            device = "iPhone";
        }

        // 🔥 3. Samsung
        else if (/samsung/i.test(userAgent)) {
            device = "Samsung Device";
        }

        // 🔥 4. Xiaomi / Redmi / Mi
        else if (/xiaomi|redmi|mi\s/i.test(userAgent)) {
            device = "Xiaomi Device";
        }

        // 🔥 5. Oppo
        else if (/oppo/i.test(userAgent)) {
            device = "Oppo Device";
        }

        // 🔥 6. Vivo
        else if (/vivo/i.test(userAgent)) {
            device = "Vivo Device";
        }

        // 🔥 7. Nothing
        else if (/nothing/i.test(userAgent)) {
            device = "Nothing Phone";
        }

        // 🔥 8. Tablet
        else if (result.device.type === "tablet") {
            device = "Tablet";
        }

        // 🔥 9. Generic mobile fallback
        else if (result.device.type === "mobile") {
            device = "Android Mobile";
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
    });