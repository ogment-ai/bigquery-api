import { Router } from 'express';
// Import the Google Cloud client library using default credentials
import { BigQuery } from '@google-cloud/bigquery';

const router = Router();
const bigquery = new BigQuery();

async function query() {
  //do anything you want here
  return "test_query_topic_1_results";
}

async function queryBigQueryTopic1() {
  const query = `SELECT *
    FROM \`ogment-dev.gold_dataset_eu.gold_table\`
    LIMIT 10`;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'europe-west3',
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