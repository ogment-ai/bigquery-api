import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ?? 3000;
const PRODUCTION_URL = process.env.PRODUCTION_URL!

// In development (tsx), files are .ts in src/
// In production (node), files are .js in dist/
const isDev = process.env.NODE_ENV !== 'production';
const routesPath = isDev
  ? path.join(__dirname, '../routes/*.ts')
  : path.join(__dirname, '../routes/*.js');
const mainPath = isDev
  ? path.join(__dirname, '../main.ts')
  : path.join(__dirname, '../main.js');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Big Query API',
      version: '1.0.0',
      description: 'A Node.js Express API that connects to Google BigQuery',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
      {
        url: PRODUCTION_URL,
        description: 'Production server (Fly.io)',
      },
    ],
  },
  apis: [routesPath, mainPath],
};

export const swaggerSpec = swaggerJsdoc(options);
