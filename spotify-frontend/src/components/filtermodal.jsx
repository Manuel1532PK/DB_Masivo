import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const FilterModal = ({ isOpen, onClose, filters, setFilters }) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Extraer géneros únicos de la lista de canciones disponibles
      // Los géneros se extraen desde el componente padre
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Géneros disponibles por defecto (se pueden expandir dinámicamente)
  const availableGenres = [
    "Rock",
    "Pop",
    "Metal",
    "Dance",
    "Disco",
    "Synthwave",
    "Pop Rock"
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Filtrar Contenido</h3>
          <button className="close-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="filter-item">
            <label>Género</label>
            <select name="genre" value={filters.genre} onChange={handleChange}>
              <option value="">Todos los géneros</option>
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
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

        <button className="btn-primary" onClick={onClose}>Aplicar Filtros</button>
      </div>
    </div>
  );
};

export default FilterModal;