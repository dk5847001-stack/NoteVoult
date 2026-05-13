require("dotenv").config();

const MongoStoreImport = require("connect-mongo");
const MongoStore = MongoStoreImport.default || MongoStoreImport;

const sessionSecret = process.env.SESSION_SECRET || "devsecret";

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    crypto: {
        secret: sessionSecret
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});

const sessionConfig = {
    store,
    name: "sessionId",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",

        // local development me false hi rahe
        secure: false
    }
};

module.exports = {
    sessionConfig,
    store
};