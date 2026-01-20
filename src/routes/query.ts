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
 *     summary: Execute SQL query
 *     description: Run an arbitrary SQL query against BigQuery and return results
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
 *                 description: SQL query to execute
 *                 example: "SELECT * FROM `project.dataset.table` LIMIT 10"
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
 *     summary: Get full data catalog
 *     description: Returns all tables across all datasets in a flat list
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
 *                       datasetId:
 *                         type: string
 *                       location:
 *                         type: string
 *                       type:
 *                         type: string
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
 *     summary: Get table schema
 *     description: Returns the schema for a specific table
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
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table schema
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       mode:
 *                         type: string
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

