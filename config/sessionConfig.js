require("dotenv").config();

const MongoStoreImport = require("connect-mongo");

// ✅ actual class/function extract
const MongoStore = MongoStoreImport.default || MongoStoreImport;

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,

    crypto: {
        secret: process.env.SECRET || process.env.SESSION_SECRET
    },

    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

const sessionConfig = {
    store,

    name: "sessionId",

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    }
};

module.exports = {
    sessionConfig,
    store
};