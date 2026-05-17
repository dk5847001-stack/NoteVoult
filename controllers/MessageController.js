const Message = require("../models/Message");

module.exports.index = (req, res) => {
    res.render("clients/Message.ejs");
}

module.exports.createMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    req.flash("success", "message was sent successfully!");
    res.redirect("/contactUs");
}

module.exports.deleteMessage = async (req, res) => {
    const { id } = req.params;

    await Message.findByIdAndDelete(id);

    req.flash("success", "User message deleted successfully!");
    res.redirect("/admin");
}