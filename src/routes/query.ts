import { Router } from 'express';
import { z } from 'zod';
import { bigquery, PROJECT_ID } from '../lib/bigquery.js';

const router = Router();

// Zod schemas for validation
const QueryRequestSchema = z.object({
  sql: z.string().min(1).max(10000),
  maxRows: z.number().int().positive().max(10000).optional().default(1000),
});

/**
 * @openapi
 * /query:
 *   post:
 *     summary: Execute SQL query (Step 3)
 *     description: |
 *       Execute a SQL query against BigQuery. IMPORTANT: Before calling this endpoint, you should:
 *       1. Call /query/catalog-datasets to find available tables
 *       2. Call /query/tables/{datasetId}/{tableId}/schema to understand column names and types
 *       
 *       Use BigQuery SQL syntax with backtick notation: `datasetId.tableId` (e.g., `silver.sentinel`).
 *       Always include a LIMIT clause to avoid returning too many rows.
 *     tags:
 *       - Query
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sql
 *             properties:
 *               sql:
 *                 type: string
 *                 description: SQL query using BigQuery syntax. Reference tables as `datasetId.tableId`. Always include LIMIT.
 *                 example: "SELECT * FROM `silver.sentinel` LIMIT 10"
 *               maxRows:
 *                 type: integer
 *                 description: Maximum number of rows to return (default 1000, max 10000)
 *                 default: 1000
 *     responses:
 *       200:
 *         description: Query results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalRows:
 *                   type: string
 *                 jobId:
 *                   type: string
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Query execution error
 */
router.post('/', async (req, res) => {
  const parsed = QueryRequestSchema.safeParse(req.body);
  
  if (!parsed.success) {
    res.status(400).json({ 
      error: 'Validation Error', 
      message: parsed.error.message 
    });
    return;
  }

  const { sql, maxRows } = parsed.data;

  const [job] = await bigquery.createQueryJob({ query: sql });
  const [rows] = await job.getQueryResults({ maxResults: maxRows });
  const [metadata] = await job.getMetadata();

  res.json({
    rows,
    totalRows: metadata.statistics?.query?.totalBytesProcessed,
    jobId: job.id,
  });
});

/**
 * @openapi
 * /query/catalog-datasets:
 *   get:
 *     summary: List all available tables (Step 1 - Start here)
 *     description: |
 *       START HERE. Returns a flat list of all available BigQuery tables across all datasets.
 *       Use this first to discover what data exists before querying.
 *       
 *       Each table includes:
 *       - id: The table name (use this in SQL queries)
 *       - datasetId: The dataset containing this table (needed for schema lookup and SQL queries)
 *       - location: Geographic region (US, EU, etc.)
 *       - type: TABLE or VIEW
 *     tags:
 *       - Query
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Flat list of all tables with their dataset info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectId:
 *                   type: string
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Table name - use in SQL as `datasetId.id`
 *                       datasetId:
 *                         type: string
 *                         description: Parent dataset - needed for schema lookup
 *                       location:
 *                         type: string
 *                         description: Geographic region (US, EU, etc.)
 *                       type:
 *                         type: string
 *                         description: TABLE or VIEW
 */
router.get('/catalog-datasets', async (req, res) => {
  const [datasets] = await bigquery.getDatasets();

  const tablesPerDataset = await Promise.all(
    datasets.map(async (ds) => {
      const [tables] = await ds.getTables();
      return tables.map(t => ({
        id: t.id,
        datasetId: ds.id,
        location: ds.metadata?.location,
        type: t.metadata?.type,
      }));
    })
  );

  res.json({
    projectId: PROJECT_ID,
    tables: tablesPerDataset.flat(),
  });
});

/**
 * @openapi
 * /query/tables/{datasetId}/{tableId}/schema:
 *   get:
 *     summary: Get table schema (Step 2 - Before querying)
 *     description: |
 *       Get column names and data types for a table BEFORE writing SQL queries.
 *       Use datasetId and tableId from the /query/catalog-datasets response.
 *       
 *       Always check the schema to:
 *       - Know the exact column names to use in SELECT
 *       - Understand data types for proper filtering
 *       - See which columns are NULLABLE vs REQUIRED
 *     tags:
 *       - Query
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: datasetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dataset ID from catalog-datasets response
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID from catalog-datasets response
 *     responses:
 *       200:
 *         description: Table schema with column definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tableId:
 *                   type: string
 *                 datasetId:
 *                   type: string
 *                 schema:
 *                   type: array
 *                   description: Array of column definitions
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Column name - use this in SQL queries
 *                       type:
 *                         type: string
 *                         description: Data type (STRING, INTEGER, TIMESTAMP, etc.)
 *                       mode:
 *                         type: string
 *                         description: NULLABLE or REQUIRED
 */
router.get('/tables/:datasetId/:tableId/schema', async (req, res) => {
  const { datasetId, tableId } = req.params;
  const table = bigquery.dataset(datasetId).table(tableId);
  const [metadata] = await table.getMetadata();

  res.json({
    tableId,
    datasetId,
    schema: metadata.schema?.fields ?? [],
    numRows: metadata.numRows,
    numBytes: metadata.numBytes,
  });
});

export default router;

