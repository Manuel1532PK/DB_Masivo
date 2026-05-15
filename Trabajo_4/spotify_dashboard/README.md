# 🎵 Spotify Analytics Dashboard

Un dashboard analítico de música construido con **React + Vite** en el frontend y **Node.js + Express + BigQuery** en el backend. Permite visualizar estadísticas de canciones, artistas y géneros a partir de un dataset real de Spotify.

## 📊 Características

- **KPIs dinámicos**: Popularidad promedio, total de canciones, contenido explícito y duración promedio
- **Gráficos interactivos**: Top géneros por popularidad (Recharts)
- **Ranking de artistas**: Top 10 artistas con barras de popularidad
- **Tabla de canciones**: Explorador con filtros y ordenamiento
- **Filtrado por género**: Todos los datos se actualizan al seleccionar un género específico
- **Diseño moderno**: Inspirado en la interfaz de Spotify

## 🛠️ Tecnologías utilizadas

### Frontend

- React 18
- Vite
- Axios
- Recharts
- Lucide React (iconos)

### Backend

- Node.js
- Express
- Google Cloud BigQuery
- Dotenv
- CORS

### Base de datos

- Google BigQuery
- Dataset con ~6300 canciones de Spotify

## 🚀 Instalación y ejecución

### Requisitos previoss

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Google Cloud Platform con BigQuery habilitado
- Archivo de credenciales JSON de una cuenta de servicio de GCP

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/spotify-dashboard.git
cd spotify-dashboard
```

### Configurar Backend

```bash
cd backend
npm install
npm run dev
```

### Endpoints de la API

Método Endpoint Descripción
GET /api/analytics/genres Lista de géneros con popularidad promedio
GET /api/analytics/artists Top artistas (soporta filtro ?genre=Rock)
GET /api/analytics/stats Estadísticas globales (soporta filtro ?genre=Rock)
GET /api/analytics/songs Lista de canciones (soporta filtro ?genre=Rock)
