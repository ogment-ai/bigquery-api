import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger.js';
import bigQueryTopic1Router from './routes/bqTopic1.js';

const app = express();
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/bqTopic1', bigQueryTopic1Router);

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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('Swagger docs available at http://localhost:3000/api-docs');
});
