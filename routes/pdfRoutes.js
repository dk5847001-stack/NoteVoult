const express = require("express");
const multer = require("multer");

const { storage } = require("../config/cloudConfig");
const pdfController = require("../controllers/pdfController");
const { validatePdf } = require("../middlewares/pdfValidation");

const isLoggedIn = require("../middlewares/AuthMiddleware");

const router = express.Router();
const upload = multer({ storage });

// ----------------------------------------------------------
// Static Routes
// ----------------------------------------------------------

router.get("/new", isLoggedIn, pdfController.renderNewForm);

router.get("/download/:id", pdfController.downloadPdf);

router.get("/api/filter", pdfController.filterPdfs);

// purchase route

// ----------------------------------------------------------
// Main Routes
// ----------------------------------------------------------

router
    .route("/")
    .get(pdfController.index)
    .post(
        upload.single("pdf"),
        validatePdf,
        pdfController.uploadPdfForm
    );
router.get("/:id", pdfController.viewProject);

// edit
router.get("/:id/edit", pdfController.renderEditForm);

// update
router.put(
    "/:id",
    isLoggedIn,
    upload.single("pdf"),
    pdfController.updatePdf
);

// delete
router.delete("/:id", pdfController.deletePdf);

module.exports = router;