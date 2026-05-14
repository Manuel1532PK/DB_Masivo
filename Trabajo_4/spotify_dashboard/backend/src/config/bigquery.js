const { BigQuery } = require("@google-cloud/bigquery");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

// Leer variables con valores por defecto para depuración
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const location = process.env.GOOGLE_LOCATION || "southamerica-east1";

console.log("📌Variables de entorno cargadas:");
console.log(`GOOGLE_CLOUD_PROJECT: ${projectId}`);
console.log(`GOOGLE_APPLICATION_CREDENTIALS: ${keyFilename}`);
console.log(`GOOGLE_LOCATION: ${location}`);

if (!projectId || !keyFilename) {
  console.error("Faltan variables obligatorias en .env");
  process.exit(1);
}

const resolvedKeyPath = path.resolve(process.cwd(), keyFilename);
if (!fs.existsSync(resolvedKeyPath)) {
  console.error(`Archivo de credenciales no encontrado: ${resolvedKeyPath}`);
  console.error("   Asegúrate de que el archivo existe y la ruta es correcta.");
  process.exit(1);
}

// Crear cliente sin especificar ubicación global para evitar problemas de ubicación
const bigquery = new BigQuery({
  projectId,
  keyFilename: resolvedKeyPath,
});

// Función helper para ejecutar queries con ubicación explícita
async function runQuery(query) {
  try {
    const options = {
      query: query,
      location: location,
      timeoutMs: 30000,
    };
    console.log(`Ejecutando consulta en ubicación: ${location}`);
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error("Error en BigQuery:", error);
    throw error;
  }
}

console.log(
  `BigQuery listo (proyecto: ${projectId}, ubicación forzada: ${location})`,
);
module.exports = { bigquery, runQuery, location };
