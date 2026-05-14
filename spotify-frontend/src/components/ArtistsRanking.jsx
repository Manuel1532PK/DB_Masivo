import React from 'react';
import { Award } from 'lucide-react';

const ArtistsRanking = ({ artists }) => {
  return (
    <div className="ranking-container">
      <h3 className="section-title">Top 10 Artistas</h3>
      <div className="artists-list">
        {artists.map((artist, index) => (
          <div key={index} className="artist-item">
            <div className="artist-rank">
              {index < 3 ? (
                <Award size={20} style={{ color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }} />
              ) : (
                <span className="rank-number">#{index + 1}</span>
              )}
            </div>
            <div className="artist-info">
              <p className="artist-name">{artist.artist}</p>
              <p className="artist-meta">{artist.song_count} canción{artist.song_count !== 1 ? 'es' : ''}</p>
            </div>
            <div className="artist-popularity">
              <div className="pop-bar-container">
                <div 
                  className="pop-bar" 
                  style={{ width: `${artist.avg_popularity}%` }}
                ></div>
              </div>
              <span className="pop-value">{Math.round(artist.avg_popularity)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistsRanking;
