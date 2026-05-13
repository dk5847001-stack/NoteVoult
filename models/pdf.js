const { ref, required } = require("joi");
const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const pdfSchema = new Schema({
    title: {
        type: String,
        minlength: [4, "title is too small"],
        maxlength: [20, "title is too large"],
        required: true
    },

    pdf: {
        url: {
            type: String,
            required: true
        },

        filename: {
            type: String,
            required: true
        }
    },

    uploadedAt: {
        type: Date,
        default: Date.now
    },

    // 🔥 Phase 2 (Timer)
    expiresAt: {
        type: Date
    },

    // 🔥 Phase 3 (Payment)
    isPaid: {
        type: Boolean,
        default: false
    },

    price: {
        type: Number,
        default: 5
    },

    branch: {
        type: String,

        enum: {
            values: ["B.Tech", "BCA", "Agriculture", "BBA", "MBA"],
            message: "Invalid branch"
        },

        required: [true, "Branch is required"]
    },

    semester: {
        type: Number,
        min: 1,
        max: 8,
        required: [true, "Semester is required"]
    },

    category: {
        type: String,

        enum: {
            values: ["micro", "notes", "projects"],
            message: "Invalid category"
        },

        default: "notes"
    },

    examType: {
        type: String,

        enum: {
            values: ["CIA", "Semester"],
            message: "Invalid exam type"
        },

        required: true,
        default: "Semester"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }

}, {
    timestamps: true
});

const Pdf = mongoose.model("Pdf", pdfSchema);

module.exports = Pdf;