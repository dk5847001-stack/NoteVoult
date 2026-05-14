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

module.exports = isLoggedIn;