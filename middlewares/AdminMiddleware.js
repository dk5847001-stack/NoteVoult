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
module.exports = isAdmin;