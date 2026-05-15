import React, { useState, useEffect } from "react";
import { getSongs, getStats, getGenres, getArtists } from "./services/api";
import SongTable from "./components/SongTable";
import FilterModal from "./components/FilterModal";
import StatCards from "./components/StatCards";
import GenresChart from "./components/GenresChart";
import ArtistsRanking from "./components/ArtistsRanking";
import { Settings2 } from "lucide-react";
import "./App.css";

function App() {
  const [songs, setSongs] = useState([]);
  const [stats, setStats] = useState({});
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ genre: "", order: "popularity" });
  const [loading, setLoading] = useState(true);

  // Cargar datos cuando cambie el filtro de género
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [songsData, statsData, genresData, artistsData] = await Promise.all(
        [
          getSongs(filters.genre), // ← Pasar género
          getStats(filters.genre), // ← Pasar género
          getGenres(),
          getArtists(filters.genre), // ← Pasar género
        ],
      );
      setSongs(songsData);
      setStats(statsData);
      setGenres(genresData);
      setArtists(artistsData);
      setLoading(false);
    };
    loadData();
  }, [filters.genre]); // ← Recargar cuando cambie el género

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1>Spotify Dashboard</h1>
        <button className="filter-trigger" onClick={() => setIsModalOpen(true)}>
          <Settings2 size={18} /> Filtros
        </button>
      </nav>

      <main className="dashboard">
        {loading ? (
          <div className="loading">Cargando datos...</div>
        ) : (
          <>
            {/* Mostrar género seleccionado */}
            {filters.genre && (
              <div className="active-filter">
                Mostrando: <strong>{filters.genre}</strong>
                <button
                  onClick={() => setFilters({ ...filters, genre: "" })}
                  className="clear-filter"
                >
                  ✕ Limpiar filtro
                </button>
              </div>
            )}

            {/* Estadísticas Globales */}
            <section className="dashboard-section">
              <StatCards stats={stats} />
            </section>

            {/* Analytics */}
            <section className="dashboard-analytics">
              <div className="analytics-col">
                <GenresChart genres={genres} />
              </div>
              <div className="analytics-col">
                <ArtistsRanking artists={artists} />
              </div>
            </section>

            {/* Tabla de Canciones */}
            <section className="dashboard-section">
              <h3 className="section-title">Explorador de Canciones</h3>
              <SongTable songs={songs} filters={filters} />
            </section>
          </>
        )}
      </main>

      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        setFilters={handleApplyFilters}
        genres={genres}
      />
    </div>
  );
}

export default App;
