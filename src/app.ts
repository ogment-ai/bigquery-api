import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger.js';
import bigQueryTopic1Router from './routes/bqTopic1.js';
import bigQueryTopic2Router from './routes/bqTopic2.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { auth } from './middelware/auth.js';

export const app = express();

// Security
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// Configurable CORS origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');
app.use(cors({
  origin: allowedOrigins ?? '*',
}));

app.use(express.json());

// Optional Swagger docs protection
const swaggerToken = process.env.SWAGGER_TOKEN;
if (swaggerToken) {
  app.use('/api-docs.json', (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') 
      ?? (req.query as Record<string, string>)?.token;
    
    if (token !== swaggerToken) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid or missing token' });
      return;
    }
    next();
  });
}

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// OpenAPI JSON spec
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Routes
app.use('/bqTopic1', auth, bigQueryTopic1Router);
app.use('/bqTopic2', auth, bigQueryTopic2Router);

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

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method}:${req.url} not found`,
    statusCode: 404,
  });
});

// Global error handler - must be last
app.use((error: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  
  res.status(error.statusCode ?? 500).json({
    error: error.name,
    message: error.message,
    statusCode: error.statusCode ?? 500,
  });
});

