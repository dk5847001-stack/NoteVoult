const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: [true, "Username is required!"],
        trim: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isBlocked: {
        type: String,
        enum: ["active", "blocked"],
        default: "active"
    }
});

// Login email se hoga
userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

const User = mongoose.model("User", userSchema);

module.exports = User;