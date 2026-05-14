function saveOriginalUrl(req, res, next) {
    if (req.session.originalUrl) {
        res.locals.originalUrl = req.session.originalUrl;
    }

    next();
}

module.exports = saveOriginalUrl;