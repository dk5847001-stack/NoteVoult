const express = require("express");
const Pdf = require("../models/pdf");
const multer = require('multer')
const { storage } = require("../config/cloudConfig");
const upload = multer({ storage });
const cloudinary = require("../config/cloudConfig").cloudinary;
const pdfController = require("../controllers/pdfController");
const router = express.Router();

router.get("/new", pdfController.renderNewForm);
router.get("/download/:id", pdfController.downloadPdf);
router.get("/api/filter", pdfController.filterPdfs);
router.route("/")
.get(pdfController.index)
.post(upload.single("pdf"), pdfController.uploadPdfForm)

module.exports = router;