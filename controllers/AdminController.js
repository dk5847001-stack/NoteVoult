const User = require("../models/User");
const Subscriber = require("../models/Subscriber");
const Message = require("../models/Message");
const Pdf = require("../models/pdf");
const LoginActivity = require("../models/LoginActivity");
const AsyncWrap = require("../utils/AsyncWrap");

module.exports.index = AsyncWrap(async (req, res) => {
    const users = await User.find({}).sort({ uploadedAt: -1 });
    const allSubscribers = await Subscriber.find({}).sort({ uploadedAt: -1 });
    const allPdfs = await Pdf.find({}).sort({ uploadedAt: -1 });
    const allMessages = await Message.find({}).sort({ uploadedAt: -1 });
    res.render("clients/adminDeshboard.ejs", { users, allSubscribers, allPdfs, allMessages });
});

module.exports.blockUser = AsyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/admin");
    }

    if(user.isBlocked === "blocked"){
        if(user.role === "admin"){
            req.flash("erro", "you can't unblock admin");
            return res.redirect("/admin");
        }
        user.isBlocked = "active";
    }
    await user.save();

    req.flash("success", "User 🔓unblocked successfully!");
    res.redirect("/admin");
});

module.exports.unblockUser = AsyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/admin");
    }

    if (user.isBlocked === "active") {
        if(user.role === "admin"){
            req.flash("error", "you can't block admin");
            return res.redirect("/admin")
        }
        user.isBlocked = "blocked";
    }

    await user.save();

    req.flash("success", "User  🔐blocked successfully!");
    res.redirect("/admin");
});

module.exports.deleteUser = AsyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if(user.role === "admin"){
        req.flash("error", "You don't have permission to delete 🛡️admin");
        return res.redirect("/admin")
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        req.flash("error", "User not found!");
        return res.redirect("/admin");
    }

    req.flash("success", "User deleted successfully");
    res.redirect("/admin");
});

module.exports.viewUserDetails = AsyncWrap(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/admin");
    }

    const logs = await LoginActivity.find({ user_id: id }).sort({ login_time: -1 });

    res.render("clients/userDetails.ejs", { user, logs });
});