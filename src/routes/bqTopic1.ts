import { Router } from 'express';
import { bigquery } from '../lib/bigquery.js';

const router = Router();

async function query() {
  //do anything you want here
  return "test_query_topic_1_results";
}

async function queryBigQueryTopic1() {
  const query = `SELECT *
    FROM \`ogment-dev.gold_dataset_eu.gold_table\`
    LIMIT 1`;

  const options = {
    query: query,
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  // Print the results
  console.log('Rows:');
  rows.forEach(row => console.log(row));

  return rows;
}

/**
 * @openapi
 * /bqTopic1/query:
 *   get:
 *     summary: Query BigQuery Topic 1
 *     description: Executes a BigQuery query and returns results from gold_table
 *     tags:
 *       - BigQuery Topic 1
 *     responses:
 *       200:
 *         description: Query results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bqResult:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/query', async (req, res) => {
  const result = await queryBigQueryTopic1();
  res.json({ bqResult: result });
});

/**
 * @openapi
 * /bqTopic1/query-test:
 *   get:
 *     summary: Test endpoint
 *     description: Returns a test message without querying BigQuery
 *     tags:
 *       - BigQuery Topic 1
 *     responses:
 *       200:
 *         description: Test response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: test_query_topic_1_results
 */
router.get('/query-test', async (req, res) => {
  const result = await query();
  res.json({ message: result });
});

export default router;
