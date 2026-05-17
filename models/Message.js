const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required!"],
            minlength: [4, "Name is too short!"],
            maxlength: [15, "Name is too long!"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required!"],
            trim: true,
            lowercase: true,
            match: [
                /^\S+@\S+\.\S+$/,
                "Please enter a valid email address!",
            ],
        },

        subject: {
            type: String,
            required: [true, "Subject is required!"],
            minlength: [8, "Subject is too short!"],
            maxlength: [25, "Subject is too long!"],
            trim: true,
        },

        message: {
            type: String,
            required: [true, "Message is required!"],
            minlength: [10, "Message is too short!"],
            maxlength: [110, "Message is too long!"],
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;