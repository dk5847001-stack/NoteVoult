require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ cloud config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET   // ✅ FIXED
});

// ✅ Storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Upload_pdf",
    allowed_formats: ["pdf"],
    resource_type: "auto",   // 🔥 required for PDF
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
  }
});

module.exports = {
  cloudinary,
  storage
};