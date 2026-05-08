const { pdfJoiSchema } = require("../utils/joiSchema");

module.exports.validatePdf = (req, res, next) => {
    const { error, value } = pdfJoiSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const message = error.details.map((el) => el.message).join(", ");

        req.flash("error", message);
        return res.redirect("/pdfs/new");
    }

    req.body = value;
    next();
};