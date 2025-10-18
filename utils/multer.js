const multer = require("multer");
const allowedFileFormat = (format) => {
  console.log(format);
  const allowedFormat = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFormat.includes(format)) return true;
  return false;
};
const storage = multer.memoryStorage(); // You can use diskStorage if storing on disk
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedFileFormat(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP image formats are allowed"));
    }
  },
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
});

module.exports = upload;
