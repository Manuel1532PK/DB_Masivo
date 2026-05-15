const analyticsService = require("../services/analyticsService");

const getGenres = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await analyticsService.getTopGenres(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getArtists = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const genre = req.query.genre || "";
    let data;

    if (genre && genre !== "") {
      data = await analyticsService.getTopArtistsByGenre(genre, limit);
    } else {
      data = await analyticsService.getTopArtists(limit);
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
const getStats = async (req, res, next) => {
  try {
    const genre = req.query.genre || "";
    let data;

    if (genre && genre !== "") {
      data = await analyticsService.getStatsByGenre(genre);
    } else {
      data = await analyticsService.getGlobalStats();
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSongs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6500;
    const genre = req.query.genre || ""; // ← Nuevo: recibir género
    let data;

    if (genre && genre !== "") {
      data = await analyticsService.getSongsByGenre(genre, limit);
    } else {
      data = await analyticsService.getAllSongs(limit);
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGenres,
  getArtists,
  getStats,
  getSongs,
};
