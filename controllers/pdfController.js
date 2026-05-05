const Pdf = require("../models/pdf");
const multer = require('multer')
const { storage } = require("../config/cloudConfig");
const upload = multer({ storage });
const cloudinary = require("../config/cloudConfig").cloudinary;

module.exports.index = async (req, res) => {
    try {
        const { category, branch, semester, minPrice } = req.query;

        // 🔥 Common filter object
        const filter = {};

        if (branch) filter.branch = branch;
        if (semester) filter.semester = Number(semester);
        if (minPrice) filter.price = { $gte: Number(minPrice) };

        // ✅ All PDFs (no filter)
        const allPdfs = await Pdf.find({});

        const allProjects = await Pdf.find({ category: "projects" });

        // ✅ Price > 10 (existing logic)
        const minPdfs = await Pdf.find({ price: { $gt: 10 } });

        // ✅ Notes (with filter)
        const allNotes = await Pdf.find({
            category: "notes",
            ...filter
        });
        const allMicros = await Pdf.find({
            category: "micro",
            ...filter
        });

        // ✅ Micros (with filter)
        const ciaMicros = await Pdf.find({
            category: "micro",
            examType: "CIA",
            ...filter
        });

        const semesterMicros = await Pdf.find({
            category: "micro",
            examType: "Semester",
            ...filter
        });

        res.render("clients/index", {
            allPdfs,
            minPdfs,
            allNotes,
            allMicros,
            ciaMicros,
            semesterMicros,
            allProjects,
            query: req.query   // 🔥 important for UI selected values
        });

    } catch (err) {
        console.log(err);
        res.send("Error loading PDFs");
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("clients/new");
}

module.exports.downloadPdf = async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);

        if (!pdf || !pdf.pdf?.filename) {
            return res.status(404).send("File not found");
        }

        const publicId = pdf.pdf.filename;

        const downloadName = `${pdf.title.replace(/[^\w\- ]+/g, "").trim() || "document"}.pdf`;

        const signedUrl = cloudinary.utils.private_download_url(
            publicId,
            "pdf",
            {
                resource_type: "image",   // 🔥 IMPORTANT
                type: "upload",
                attachment: downloadName
            }
        );

        return res.redirect(signedUrl);

    } catch (err) {
        console.error(err);
        res.status(500).send("Download failed");
    }
}

module.exports.uploadPdfForm = async (req, res) => {
    try {
        const { title, price, branch, semester, category } = req.body;

        // 🔴 Basic validation
        if (!title || !price || !branch || !semester || !category) {
            req.flash("error", "All fields are required!");
            return res.redirect("/pdfs/new");
        }

        // 🔴 File check
        if (!req.file) {
            req.flash("error", "Please upload a PDF file!");
            return res.redirect("/pdfs/new");
        }

        // 🔴 File type check (extra safety)
        if (!req.file.mimetype.includes("pdf")) {
            req.flash("error", "Only PDF files are allowed!");
            return res.redirect("/pdfs/new");
        }

        // 🔴 Safe number conversion
        const parsedPrice = parseFloat(price);
        const parsedSemester = parseInt(semester);

        if (isNaN(parsedPrice) || isNaN(parsedSemester)) {
            req.flash("error", "Invalid price or semester!");
            return res.redirect("/pdfs/new");
        }

        const newPdf = new Pdf({
            title,
            pdf: {
                url: req.file.path,
                filename: req.file.filename
            },
            price: parsedPrice,
            branch,
            semester: parsedSemester,
            category
        });

        await newPdf.save();

        req.flash("success", "PDF uploaded successfully!");
        res.redirect("/pdfs");

    } catch (err) {
        console.error("UPLOAD ERROR:", err);

        req.flash("error", "Something went wrong while uploading!");
        res.redirect("/pdfs/new");
    }
};

module.exports.filterPdfs = async (req, res) => {
    try {
        const { category, branch, semester, minPrice } = req.query;

        const filter = {};

        if (category) filter.category = category;
        if (branch) filter.branch = branch;
        if (semester) filter.semester = Number(semester);
        if (minPrice) filter.price = { $gte: Number(minPrice) };

        const pdfs = await Pdf.find(filter).sort({ uploadedAt: -1 });

        res.json(pdfs);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Filter failed" });
    }
};