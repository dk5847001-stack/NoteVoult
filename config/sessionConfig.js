require("dotenv").config();
const sessionConfig = {
    name: "sessionId", // custom cookie name (default 'connect.sid' avoid karo)

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false, // ⚠️ better security

    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        // httpOnly: true,  // JS access block (XSS protection)
        // secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        // sameSite: "lax" // CSRF protection basic level
    }
};

module.exports = sessionConfig;