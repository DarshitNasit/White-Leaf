const path = require("path");
const uuid = require("uuid");
const multer = require("multer");

// Storage for Images
const storage = multer.diskStorage({
  destination: (req, file, call_back) => {
    call_back(null, "./public/images");
  },
  filename: (req, file, call_back) => {
    call_back(null, uuid.v4() + "--" + file.originalname);
  },
});

// File filter to ensure only images
const fileFilter = (req, file, call_back) => {
  const mime_type = file.mimetype;
  if (
    mime_type == "image/png" ||
    mime_type == "image/jpg" ||
    mime_type == "image/jpeg"
  )
    call_back(null, true);
  else {
    req.flash("danger", "Images Only !!!");
    call_back(null, false);
  }
};

// Upload variable
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
