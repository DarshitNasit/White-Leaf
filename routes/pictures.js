const router = require("express").Router();

// View Picture
router.get("/view-picture/:id", (req, res, next) => {});

// Upload Picture(s) Get
router.get("/upload-picture", (req, res, next) => {});

// Upload Picture(s)
router.post("/upload-picture", (req, res, next) => {});

// Delete Picture(s)
router.get("/delete-picture", (req, res, next) => {});

module.exports = router;
