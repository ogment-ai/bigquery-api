import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = process.env.GCP_PROJECT_ID!;
const LOCATION = process.env.GCP_LOCATION; // Optional - if not set, BigQuery auto-routes to correct region
const CREDENTIALS_JSON = process.env.GCP_CREDENTIALS_JSON!;

function createBigQueryClient() {
  const options: {
    projectId: string;
    location?: string;
    credentials?: { client_email: string; private_key: string };
  } = {
    projectId: PROJECT_ID,
  };

  // Only set location if explicitly provided
  if (LOCATION) {
    options.location = LOCATION;
  }

  if (CREDENTIALS_JSON) {
    // Parse credentials from JSON string (for Fly.io secrets)
    options.credentials = JSON.parse(CREDENTIALS_JSON) as {
      client_email: string;
      private_key: string;
    };
  }

  return new BigQuery(options);
}

export const bigquery = createBigQueryClient();
export { PROJECT_ID, LOCATION };
