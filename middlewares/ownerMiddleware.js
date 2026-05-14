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
module.exports = isOwner;