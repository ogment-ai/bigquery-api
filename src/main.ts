import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger.js';
import bigQueryTopic1Router from './routes/bqTopic1.js';
import bigQueryTopic2Router from './routes/bqTopic2.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// OpenAPI JSON spec
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Routes
app.use('/bqTopic1', bigQueryTopic1Router);
app.use('/bqTopic2', bigQueryTopic2Router);

/**
 * @openapi
 * /:
 *   get:
 *     summary: Hello World
 *     description: Returns a hello message
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello World!
 */
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns API health status
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The API is healthy!
 */
app.get('/health', (req, res) => {
  res.json({ message: 'The API is healthy!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on 0.0.0.0:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
});
