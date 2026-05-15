const SongTable = ({ songs, filters }) => {
  const processedSongs = [...songs]
    .filter((song) => !filters.genre || song.genre === filters.genre)
    .sort((a, b) => {
      if (filters.order === "alphabetical")
        return a.song_name.localeCompare(b.song_name);
      if (filters.order === "duration") return b.duration_sec - a.duration_sec;
      return b.popularity - a.popularity; // Por defecto popularidad
    });

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Artista</th>
            <th>Género</th>
            <th>Popularidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          {processedSongs.map((song, i) => (
            <tr key={i}>
              <td className="highlight-text">{song.song_name}</td>
              <td>{song.artist}</td>
              <td>
                <span className="badge">{song.genre || "N/A"}</span>
              </td>
              <td>
                <div className="pop-container">
                  <div
                    className="pop-bar"
                    style={{ width: `${song.popularity}%` }}
                  ></div>
                  <span>{song.popularity}%</span>
                </div>
              </td>
              <td>
                {Math.floor(song.duration_sec / 60)}:
                {(song.duration_sec % 60).toString().padStart(2, "0")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongTable;
