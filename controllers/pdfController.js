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

        const allProjects = await Pdf.find({category: "projects"});

        // ✅ Price > 10 (existing logic)
        const minPdfs = await Pdf.find({ price: { $gt: 10 } });

        // ✅ Notes (with filter)
        const allNotes = await Pdf.find({
            category: "notes",
            ...filter
        });

        // ✅ Micros (with filter)
        const allMicros = await Pdf.find({
            category: "micro",
            ...filter
        });

        res.render("clients/index", {
            allPdfs,
            minPdfs,
            allNotes,
            allMicros,
            allProjects,
            query: req.query   // 🔥 important for UI selected values
        });

    } catch (err) {
        console.log(err);
        res.send("Error loading PDFs");
    }
};

module.exports.renderNewForm = (req, res)=>{
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

        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const newPdf = new Pdf({
            title,
            pdf: {
                url: req.file.path,
                filename: req.file.filename
            },
            price: Number(price),
            branch,
            semester: Number(semester),
            category
        });

        await newPdf.save();

        res.redirect("/pdfs");

    } catch (err) {
        console.error(err);

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