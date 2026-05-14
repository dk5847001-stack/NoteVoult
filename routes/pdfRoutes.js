const express = require("express");
const multer = require("multer");

const { storage } = require("../config/cloudConfig");
const pdfController = require("../controllers/pdfController");
const { validatePdf } = require("../middlewares/pdfValidation");

const isLoggedIn = require("../middlewares/AuthMiddleware");
const isAdmin = require("../middlewares/AdminMiddleware");

const router = express.Router();
const upload = multer({ storage });

router.get("/new", isLoggedIn, pdfController.renderNewForm);

router.get("/download/:id", isLoggedIn, pdfController.downloadPdf);

router.get("/api/filter", pdfController.filterPdfs);

router
    .route("/")
    .get(pdfController.index)
    .post(upload.single("pdf"), validatePdf, pdfController.uploadPdfForm);

router.get("/:id", pdfController.viewProject);

module.exports = router;