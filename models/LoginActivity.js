const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginActivitySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",   // User model se link
        required: true
    },
    device: {
        type: String,
        default: "Unknown"
    },
    browser: {
        type: String
    },
    os: {
        type: String
    },
    ip: {
        type: String
    },
    location: {
        type: String
    },
    device_id: {
        type: String
    },
    login_time: {
        type: Date,
        default: Date.now
    }
});

const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);

module.exports = LoginActivity;