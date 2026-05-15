# Plan de Despliegue - Spotify Analytics Dashboard

## 📋 Resumen

| Componente | Plataforma | Directorio |
|------------|-----------|------------|
| Backend (API) | Render | `backend/` |
| Frontend (React) | Vercel | `frontend/` |

---

## 📦 Backend - Render

### Configuración del Servicio Web

| Configuración | Valor |
|--------------|-------|
| **Runtime** | Node |
| **Region** | `southamerica-east1` (recomendado, cerca de BigQuery) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/app.js` |
| **Plan** | Free |

### Variables de Entorno (Render Dashboard)

| Variable | Valor | Notas |
|----------|-------|-------|
| `PORT` | *(auto)* | Render asigna el puerto automáticamente |
| `NODE_ENV` | `production` | |
| `GOOGLE_CLOUD_PROJECT` | `spotify-analytics-496222` | |
| `GOOGLE_APPLICATION_CREDENTIALS` | *(contenido del JSON)* | Pegar el contenido completo de `data/credentials.json` en **una sola línea** (ver sección de credenciales) |
| `GOOGLE_LOCATION` | `southamerica-east1` | |

### ⚠️ Gestión de Credenciales de GCP

El backend se autentica con Google BigQuery usando una **cuenta de servicio**. En local se usa un archivo `data/credentials.json`. En Render **no hay sistema de archivos persistente**, por lo que se debe inyectar el JSON como variable de entorno.

**Cambio necesario en `backend/src/config/bigquery.js`:**

Agregar detección de JSON inline:

```js
const credentialsRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let bigquery;
if (credentialsRaw && credentialsRaw.trim().startsWith('{')) {
  // Render: credentials como JSON inline
  const credentials = JSON.parse(credentialsRaw);
  bigquery = new BigQuery({ projectId, credentials });
} else if (credentialsRaw) {
  // Local: credentials como ruta de archivo
  const resolvedKeyPath = path.resolve(process.cwd(), credentialsRaw);
  bigquery = new BigQuery({ projectId, keyFilename: resolvedKeyPath });
}
```

### 📌 Notas Backend

- El archivo `.env` local NO se sube al repositorio (ya está en `.gitignore`)
- El puerto lo asigna Render como `PORT`
- La ubicación de BigQuery debe coincidir con donde están los datos: `southamerica-east1`
- No olvidar la dependencia `@google-cloud/bigquery` en `package.json` (ya incluida)

---

## 🎨 Frontend - Vercel

### Configuración del Proyecto

| Configuración | Valor |
|--------------|-------|
| **Framework** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Plan** | Hobby (Free) |

### Variables de Entorno (Vercel Dashboard)

| Variable | Valor | Notas |
|----------|-------|-------|
| `VITE_API_URL` | `https://<TU-BACKEND>.onrender.com/api/analytics` | Reemplazar con la URL real de Render |

### ✅ Cambio requerido en `frontend/src/services/api.js`

La URL del API está hardcodeada a `localhost:3000`. Cambiar para usar variable de entorno:

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/analytics";
```

### 📌 Notas Frontend

- Vite se autodetecta en Vercel, no necesita configuración extra
- No olvidar añadir `VITE_API_URL` en el dashboard de Vercel
- Las variables de entorno en Vite deben tener el prefijo `VITE_`

---

## 🔄 Flujo de Despliegue

### 1. Preparación del código

```bash
# 1. Modificar backend/src/config/bigquery.js (soporte JSON inline)
# 2. Modificar frontend/src/services/api.js (usar VITE_API_URL)
# 3. Commit y push a GitHub
```

### 2. Desplegar Backend (Render)

1. Ir a [Render Dashboard](https://dashboard.render.com)
2. Crear **New Web Service**
3. Conectar repositorio de GitHub
4. Configurar:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/app.js`
5. Añadir variables de entorno (ver tabla arriba)
6. Desplegar
7. Copiar la URL asignada (ej: `https://spotify-api.onrender.com`)

### 3. Desplegar Frontend (Vercel)

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Importar repositorio de GitHub
3. Configurar:
   - **Root Directory**: `frontend`
   - **Framework**: Vite (se detecta automáticamente)
4. Añadir variable `VITE_API_URL` con la URL del backend
5. Desplegar

---

## 🛠️ Cambios Técnicos Necesarios

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `backend/src/config/bigquery.js` | Soporte para credentials como JSON inline | Alta |
| `frontend/src/services/api.js` | Usar `import.meta.env.VITE_API_URL` | Alta |

---

## 🔍 Verificación Post-Despliegue

- [ ] Health check: `GET https://<backend>.onrender.com/api/health` → `200 OK`
- [ ] Endpoint genres: `GET https://<backend>.onrender.com/api/analytics/genres` → JSON válido
- [ ] Frontend carga sin errores de CORS
- [ ] Gráficos y tabla renderizan datos correctamente
- [ ] Filtros por género funcionan

---

## 🚨 Problemas Conocidos

1. **CORS**: El backend ya tiene `cors()` habilitado, debería funcionar con cualquier origen
2. **Cold Start**: En plan free de Render, el backend se duerme tras 15 min de inactividad (primer request tarda ~30s)
3. **Timeout de BigQuery**: Las queries tienen timeout de 30s configurado

---

## 📁 Estructura del Repositorio

```
spotify_dashboard/
├── DEPLOY_PLAN.md          ← Este archivo
├── README.md
├── backend/
│   ├── package.json
│   ├── .env                ← No se sube (gitignorado)
│   ├── .gitignore
│   ├── data/
│   │   └── credentials.json ← No se sube (gitignorado)
│   └── src/
│       ├── app.js
│       ├── config/bigquery.js
│       ├── routes/analyticsRoutes.js
│       ├── controllers/analyticsController.js
│       └── services/analyticsService.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── components/
        └── services/api.js
```
