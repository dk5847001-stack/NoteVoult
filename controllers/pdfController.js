const Pdf = require("../models/pdf");
const cloudinary = require("../config/cloudConfig").cloudinary;
const AsyncWrap = require("../utils/AsyncWrap");

module.exports.index = AsyncWrap(async (req, res) => {
    try {
        const { branch, semester, minPrice } = req.query;

        // ✅ Common filter object
        const filter = {};

        if (branch) filter.branch = branch;

        if (semester) {
            filter.semester = Number(semester);
        }

        if (minPrice) {
            filter.price = { $gte: Number(minPrice) };
        }

        // ✅ New uploaded first
        const sortNewest = { createdAt: -1 };

        // ✅ All PDFs
        const allPdfs = await Pdf.find()
            .sort(sortNewest);

        // ✅ Projects
        const allProjects = await Pdf.find({
            category: "projects"
        }).sort(sortNewest);

        // ✅ Price > 10
        const minPdfs = await Pdf.find({
            price: { $gt: 10 }
        }).sort(sortNewest);

        // ✅ Notes
        const allNotes = await Pdf.find({
            category: "notes",
            ...filter
        }).sort(sortNewest);

        // ✅ All Micros
        const allMicros = await Pdf.find({
            category: "micro",
            ...filter
        }).sort(sortNewest);

        // ✅ CIA Micros
        const ciaMicros = await Pdf.find({
            category: "micro",
            examType: "CIA",
            ...filter
        }).sort(sortNewest);

        // ✅ Semester Micros
        const semesterMicros = await Pdf.find({
            category: "micro",
            examType: "Semester",
            ...filter
        }).sort(sortNewest);

        res.render("clients/index", {
            allPdfs,
            minPdfs,
            allNotes,
            allMicros,
            ciaMicros,
            semesterMicros,
            allProjects,
            query: req.query
        });

    } catch (err) {
        console.log("INDEX ERROR:", err);

        req.flash("error", "Failed to load PDFs!");
        res.redirect("/");
    }
});

module.exports.renderNewForm = AsyncWrap((req, res) => {
    res.render("clients/new");
});

module.exports.downloadPdf = AsyncWrap(async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);

        if (!pdf || !pdf.pdf?.filename) {
            return res.status(404).send("File not found");
        }
        if (pdf.unlockAt && new Date(pdf.unlockAt) > new Date()) {
            req.flash("error", "This note is locked right now!");
            return res.redirect("/pdfs");
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
        req.flash("success", "Pdf download successfully!")
        return res.redirect(signedUrl);

    } catch (err) {
        console.error(err);
        res.status(500).send("Download failed");
    }
});

module.exports.uploadPdfForm = AsyncWrap(async (req, res) => {
    try {
        const {
            title,
            price,
            branch,
            semester,
            category,
            examType,
            unlockAt
        } = req.body;

        console.log("REQ BODY:", req.body);
        console.log("UNLOCK AT:", unlockAt);

        // 🔴 Basic validation
        if (!title || price === undefined || !branch || !semester || !category || !examType) {
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

        // 🔒 Unlock date/time validation
        let finalUnlockAt = null;

        if (unlockAt && unlockAt.toString().trim() !== "") {
            finalUnlockAt = new Date(unlockAt);

            if (isNaN(finalUnlockAt.getTime())) {
                req.flash("error", "Invalid unlock date and time!");
                return res.redirect("/pdfs/new");
            }
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
            category,
            examType,
            unlockAt: finalUnlockAt,
            owner: req.user._id
        });

        await newPdf.save();

        req.flash("success", "PDF uploaded successfully!");
        res.redirect("/pdfs");

    } catch (err) {
        console.error("UPLOAD ERROR:", err);

        req.flash("error", "Something went wrong while uploading!");
        res.redirect("/pdfs/new");
    }
});

module.exports.filterPdfs = AsyncWrap(async (req, res) => {
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
});

module.exports.viewProject = AsyncWrap(async (req, res) => {
    const { id } = req.params;
    const pdf = await Pdf.findById(id);
    console.log(pdf)
    res.render("clients/show", { pdf });
});

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const pdf = await Pdf.findById(id);
    res.render("clients/edit.ejs", { pdf });
}

module.exports.updatePdf = AsyncWrap(async (req, res) => {
    const { id } = req.params;

    const {
        title,
        price,
        branch,
        semester,
        category,
        examType,
        unlockAt
    } = req.body;

    const pdfDoc = await Pdf.findById(id);

    if (!pdfDoc) {
        req.flash("error", "PDF not found!");
        return res.redirect("/admin");
    }

    // ✅ Basic validation
    if (
        !title ||
        price === undefined ||
        price === "" ||
        !branch ||
        !semester ||
        !category ||
        !examType
    ) {
        req.flash("error", "All fields are required!");
        return res.redirect(`/pdfs/${id}/edit`);
    }

    // ✅ Number conversion
    const parsedPrice = parseFloat(price);
    const parsedSemester = parseInt(semester);

    if (isNaN(parsedPrice) || isNaN(parsedSemester)) {
        req.flash("error", "Invalid price or semester!");
        return res.redirect(`/pdfs/${id}/edit`);
    }

    // ✅ Unlock date/time validation
    let finalUnlockAt = null;

    if (unlockAt && unlockAt.toString().trim() !== "") {
        finalUnlockAt = new Date(unlockAt);

        if (isNaN(finalUnlockAt.getTime())) {
            req.flash("error", "Invalid unlock date and time!");
            return res.redirect(`/pdfs/${id}/edit`);
        }
    }

    // ✅ Update normal fields
    pdfDoc.title = title;
    pdfDoc.price = parsedPrice;
    pdfDoc.branch = branch;
    pdfDoc.semester = parsedSemester;
    pdfDoc.category = category;
    pdfDoc.examType = examType;
    pdfDoc.unlockAt = finalUnlockAt;

    // ✅ Agar new PDF upload hua hai tabhi old PDF replace karo
    if (req.file) {
        if (!req.file.mimetype.includes("pdf")) {
            req.flash("error", "Only PDF files are allowed!");
            return res.redirect(`/pdfs/${id}/edit`);
        }

        // ✅ Old file Cloudinary se delete
        if (pdfDoc.pdf && pdfDoc.pdf.filename) {
            await cloudinary.uploader.destroy(pdfDoc.pdf.filename, {
                resource_type: "image"
            });
        }

        // ✅ New file save
        pdfDoc.pdf = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await pdfDoc.save();

    req.flash("success", "PDF updated successfully!");
    res.redirect("/admin");
});

module.exports.deletePdf = AsyncWrap(async (req, res) => {
    const { id } = req.params;

    const pdfDoc = await Pdf.findById(id);

    if (!pdfDoc) {
        req.flash("error", "PDF not found!");
        return res.redirect("/admin");
    }

    const publicId = pdfDoc.pdf.filename;

    console.log("Cloudinary publicId:", publicId);

    const cloudResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
    });

    console.log("Cloudinary delete result:", cloudResult);

    if (cloudResult.result !== "ok") {
        req.flash("error", "Cloudinary file not deleted!");
        return res.redirect("/admin");
    }

    await Pdf.findByIdAndDelete(id);

    req.flash("success", "PDF deleted successfully!");
    res.redirect("/admin");
})