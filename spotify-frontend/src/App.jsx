import React, { useState, useEffect } from 'react';
import { getSongs, getStats, getGenres, getArtists } from './services/api';
import SongTable from './components/SongTable';
import FilterModal from './components/FilterModal';
import StatCards from './components/StatCards';
import GenresChart from './components/GenresChart';
import ArtistsRanking from './components/ArtistsRanking';
import { Settings2 } from 'lucide-react';
import './App.css';

function App() {
  const [songs, setSongs] = useState([]);
  const [stats, setStats] = useState({});
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ genre: '', order: 'popularity' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [songsData, statsData, genresData, artistsData] = await Promise.all([
        getSongs(),
        getStats(),
        getGenres(),
        getArtists()
      ]);
      setSongs(songsData);
      setStats(statsData);
      setGenres(genresData);
      setArtists(artistsData);
      setLoading(false);
    };
    loadData();
  }, []);

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
        setFilters={setFilters}
      />
    </div>
  );
}

export default App;