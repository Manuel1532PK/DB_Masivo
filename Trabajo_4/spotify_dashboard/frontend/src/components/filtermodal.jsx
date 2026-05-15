import { X } from "lucide-react";

const FilterModal = ({ isOpen, onClose, filters, setFilters, genres }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Filtrar Contenido</h3>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="filter-item">
            <label>Género</label>
            <select name="genre" value={filters.genre} onChange={handleChange}>
              <option value="">
                Todos los géneros (
                {genres ? genres.reduce((acc, g) => acc + g.count, 0) : 0}{" "}
                canciones)
              </option>
              {genres &&
                genres.map((genreItem, idx) => (
                  <option key={idx} value={genreItem.genre}>
                    {genreItem.genre} ({genreItem.count} canciones)
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Ordenar por</label>
            <select name="order" value={filters.order} onChange={handleChange}>
              <option value="popularity">Más Populares</option>
              <option value="alphabetical">Nombre (A-Z)</option>
              <option value="duration">Duración</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={onClose}>
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterModal;
