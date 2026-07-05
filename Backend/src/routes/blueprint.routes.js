const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { protect } = require("../middlewares/authMiddleware");
const {
  generateBlueprint,
  getPastAnalysis,
} = require("../controllers/blueprint.controller");

router.post("/process", protect, upload.single("document"), generateBlueprint);

router.get("/history", protect, getPastAnalysis);

module.exports = router;
