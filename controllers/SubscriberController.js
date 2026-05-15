const Subscriber = require("../models/Subscriber");

module.exports.index = async (req, res) => {
    const allSubscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });

    res.render("clients/subscriber.ejs", { allSubscribers });
}

module.exports.newSubscriber = async (req, res) => {
    const { email } = req.body;

    await Subscriber.create({ email });

    req.flash("success", "🎉 You subscribed successfully!");

    res.redirect(req.get("Referrer") || "/");
}