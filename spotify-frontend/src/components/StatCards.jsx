import React from 'react';
import { Music, BarChart3, AlertCircle, Clock } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} min ${secs} seg`;
  };

  const cards = [
    {
      icon: <BarChart3 size={24} />,
      label: 'Popularidad Promedio',
      value: stats.avg_popularity ? `${Math.round(stats.avg_popularity)}%` : 'N/A',
      color: '#1DB954'
    },
    {
      icon: <Music size={24} />,
      label: 'Total de Canciones',
      value: stats.total_songs || '0',
      color: '#1DB954'
    },
    {
      icon: <AlertCircle size={24} />,
      label: 'Contenido Explícito',
      value: stats.explicit_percentage ? `${stats.explicit_percentage}%` : 'N/A',
      color: '#FF6B6B'
    },
    {
      icon: <Clock size={24} />,
      label: 'Duración Promedio',
      value: formatDuration(stats.avg_duration_sec),
      color: '#1DB954'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon" style={{ color: card.color }}>
            {card.icon}
          </div>
          <div className="stat-content">
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
