// Import the Google Cloud client library using default credentials
// const {BigQuery} = require('@google-cloud/bigquery');
import { BigQuery } from '@google-cloud/bigquery';
const bigquery = new BigQuery();
async function query() {
  // Queries the U.S. given names dataset for the state of Texas.

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
}

query();