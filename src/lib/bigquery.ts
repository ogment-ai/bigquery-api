import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = process.env.GCP_PROJECT_ID ?? 'ogment-dev';
const LOCATION = process.env.GCP_LOCATION ?? 'europe-west3';
const CREDENTIALS_JSON = process.env.GCP_CREDENTIALS_JSON;

function createBigQueryClient() {
  if (CREDENTIALS_JSON) {
    // Parse credentials from JSON string (for Fly.io secrets)
    const credentials = JSON.parse(CREDENTIALS_JSON) as {
      client_email: string;
      private_key: string;
    };
    return new BigQuery({
      projectId: PROJECT_ID,
      location: LOCATION,
      credentials: credentials,
    });
  }

  // Fall back to default credentials (ADC)
  return new BigQuery({
    projectId: PROJECT_ID,
    location: LOCATION,
  });
}

export const bigquery = createBigQueryClient();
export { PROJECT_ID, LOCATION };

