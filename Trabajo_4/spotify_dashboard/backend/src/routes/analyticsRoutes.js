const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// rutas para los endpoints de analytics
router.get("/genres", analyticsController.getGenres);
router.get("/artists", analyticsController.getArtists);
router.get("/stats", analyticsController.getStats);
router.get("/songs", analyticsController.getSongs);

module.exports = router;
