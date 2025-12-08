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
    LIMIT 10`;

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

router.get('/query', async (req, res) => {
  const result = await queryBigQueryTopic1();
  res.json({ bqResult: result });
});

router.get('/query-test', async (req, res) => {
  const result = await query();
  res.json({ message: result });
});

export default router;
