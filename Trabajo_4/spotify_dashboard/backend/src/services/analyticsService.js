const { runQuery } = require("../config/bigquery");

const datasetId = "spotify_dataset";
const tableId = "spotify_dashboard";
const projectId = process.env.GOOGLE_CLOUD_PROJECT;

// 1. Géneros más populares (por popularidad promedio)
const getTopGenres = async (limit = 10) => {
  const query = `
        SELECT 
            genre, 
            AVG(popularity) AS avg_popularity, 
            COUNT(*) AS count
        FROM \`${projectId}.${datasetId}.${tableId}\`
        WHERE genre IS NOT NULL AND genre != ''
        GROUP BY genre
        ORDER BY avg_popularity DESC
        LIMIT ${limit}
    `;
  return await runQuery(query);
};

// 2. Top artistas (artistas con mayor popularidad promedio)
const getTopArtists = async (limit = 10) => {
  const query = `
        SELECT 
            artists AS artist, 
            AVG(popularity) AS avg_popularity, 
            COUNT(*) AS song_count
        FROM \`${projectId}.${datasetId}.${tableId}\`
        WHERE artists IS NOT NULL
        GROUP BY artists
        ORDER BY avg_popularity DESC
        LIMIT ${limit}
    `;
  return await runQuery(query);
};

// 3. Estadísticas globales (promedio de popularidad, duración, porcentaje de canciones explícitas)
const getGlobalStats = async () => {
  const query = `
        SELECT
            AVG(popularity) AS avg_popularity,
            AVG(duration_ms) AS avg_duration_ms,
            COUNTIF(explicit = true) AS explicit_count,
            COUNTIF(explicit = false) AS non_explicit_count,
            COUNT(*) AS total_songs
        FROM \`${projectId}.${datasetId}.${tableId}\`
    `;
  const rows = await runQuery(query);
  const stats = rows[0] || {};
  stats.avg_duration_sec = Math.round((stats.avg_duration_ms || 0) / 1000);
  const total = stats.total_songs || 1;
  stats.explicit_percentage = ((stats.explicit_count / total) * 100).toFixed(1);
  return stats;
};

// 4. Listado de canciones (populares primero)
const getAllSongs = async (limit = 100) => {
  const query = `
        SELECT 
            name AS song_name, 
            artists AS artist, 
            album, 
            genre, 
            popularity, 
            ROUND(duration_ms / 1000, 0) AS duration_sec,
            explicit
        FROM \`${projectId}.${datasetId}.${tableId}\`
        ORDER BY popularity DESC
        LIMIT ${limit}
    `;
  return await runQuery(query);
};

module.exports = {
  getTopGenres,
  getTopArtists,
  getGlobalStats,
  getAllSongs,
};
