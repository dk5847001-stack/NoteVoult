const Joi = require("joi");

const pdfJoiSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(4)
        .max(20)
        .required()
        .messages({
            "string.empty": "Title is required",
            "string.min": "Title is too small",
            "string.max": "Title is too large",
            "any.required": "Title is required"
        }),

    price: Joi.number()
        .min(0)
        .default(5)
        .messages({
            "number.base": "Price must be a number",
            "number.min": "Price cannot be negative"
        }),

    branch: Joi.string()
        .valid("B.Tech", "BCA", "Agriculture", "BBA", "MBA")
        .required()
        .messages({
            "any.only": "Invalid branch",
            "string.empty": "Branch is required",
            "any.required": "Branch is required"
        }),

    semester: Joi.number()
        .integer()
        .min(1)
        .max(8)
        .required()
        .messages({
            "number.base": "Semester must be a number",
            "number.integer": "Semester must be an integer",
            "number.min": "Semester must be at least 1",
            "number.max": "Semester cannot be more than 8",
            "any.required": "Semester is required"
        }),

    category: Joi.string()
        .valid("micro", "notes", "projects")
        .default("notes")
        .messages({
            "any.only": "Invalid category"
        }),

    examType: Joi.string()
        .valid("CIA", "Semester")
        .default("Semester")
        .messages({
            "any.only": "Invalid exam type"
        }),

    expiresAt: Joi.date()
        .optional()
        .allow(null, "")
        .messages({
            "date.base": "Expires date must be valid"
        }),

    unlockAt: Joi.date()
        .optional()
        .allow(null, "")
        .messages({
            "date.base": "Unlock date and time must be valid"
        }),

    isPaid: Joi.boolean()
        .default(false)
}).options({
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
});

module.exports = {
    pdfJoiSchema
};