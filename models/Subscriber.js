const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriberSchema = new Schema({
    email: {
        type: String,

        required: [true, "😢 Please enter email address before subscribing!"],

        unique: true,

        trim: true,

        lowercase: true,

        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },

            message: "🚫 Please enter a valid email address!"
        }
    },

    subscribedAt: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
});


// 🚫 Duplicate email custom message
subscriberSchema.post("save", function (error, doc, next) {

    if (error.code === 11000) {
        next(new Error("📧 This email is already subscribed!"));
    } else {
        next(error);
    }

});

module.exports = mongoose.model("Subscriber", subscriberSchema);