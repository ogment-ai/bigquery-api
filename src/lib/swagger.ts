import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT ?? 3000;
const PRODUCTION_URL = process.env.PRODUCTION_URL! ?? 'https://big-query-api-aged-hill-1301.fly.dev';

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
  apis: ['./src/routes/*.ts', './src/main.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
