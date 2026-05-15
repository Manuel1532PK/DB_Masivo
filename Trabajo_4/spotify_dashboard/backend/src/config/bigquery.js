const { BigQuery } = require("@google-cloud/bigquery");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const credentialsRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const location = process.env.GOOGLE_LOCATION || "southamerica-east1";

console.log("📌 Variables de entorno cargadas:");
console.log(`GOOGLE_CLOUD_PROJECT: ${projectId}`);
console.log(`GOOGLE_LOCATION: ${location}`);

if (!projectId || !credentialsRaw) {
  console.error("Faltan variables obligatorias en .env");
  process.exit(1);
}

let bigquery;
if (credentialsRaw.trim().startsWith("{")) {
  const credentials = JSON.parse(credentialsRaw);
  bigquery = new BigQuery({ projectId, credentials });
  console.log("✅ Credenciales cargadas desde variable de entorno (JSON inline)");
} else {
  const resolvedKeyPath = path.resolve(process.cwd(), credentialsRaw);
  if (!fs.existsSync(resolvedKeyPath)) {
    console.error(`Archivo de credenciales no encontrado: ${resolvedKeyPath}`);
    process.exit(1);
  }
  bigquery = new BigQuery({ projectId, keyFilename: resolvedKeyPath });
  console.log("✅ Credenciales cargadas desde archivo local");
}

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
