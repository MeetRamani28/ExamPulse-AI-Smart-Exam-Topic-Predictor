const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain"];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(
        new Error("Invalid file type! Only PDF and TXT documents are allowed."),
        false,
      );
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = upload;
