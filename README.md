# Big Query API

A Node.js Express API that connects to Google BigQuery.

## Project Structure

```
big-query-api/
├── src/
│   ├── main.ts              # Entry point - Express server setup
│   ├── lib/
│   │   └── bigquery.ts      # BigQuery client configuration
│   └── routes/
│       ├── bqTopic1.ts      # Routes for BigQuery topic 1
│       └── bqTopic2.ts      # Routes for BigQuery topic 2
├── dist/                    # Compiled JavaScript (generated)
├── .env                     # Environment variables (create this)
├── Dockerfile               # Docker configuration for deployment
├── fly.toml                 # Fly.io deployment config
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 22+
- npm
- Google Cloud account with BigQuery access
- Service account JSON key (for production)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```bash
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=europe-west3
GCP_CREDENTIALS_JSON=
```

### 3. Configure Google Cloud authentication

1. Get your service account JSON key file
2. Convert it to a single line:
   ```bash
   cat /path/to/service-account.json | tr -d '\n'
   ```
3. Paste the output as `GCP_CREDENTIALS_JSON` in your `.env` file

### 4. Run the development server

```bash
npm run dev
```

The server will start at `http://localhost:3000` and auto-restart on file changes.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled production server |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check - returns hello message |
| GET | `/health` | Health check endpoint |
| GET | `/bqTopic1/query` | Execute BigQuery query for topic 1 |
| GET | `/bqTopic1/query-test` | Test endpoint for topic 1 |
| GET | `/bqTopic2/query` | Test endpoint for topic 2 |

## Deployment (Fly.io)

### 1. Install Fly CLI

```bash
brew install flyctl
```

### 2. Login to Fly

```bash
fly auth login
```

### 3. Set secrets

```bash
fly secrets set GCP_CREDENTIALS_JSON="$(cat /path/to/service-account.json)"
fly secrets set GCP_PROJECT_ID="your-project-id"
fly secrets set GCP_LOCATION="europe-west3"
```

### 4. Deploy

```bash
fly deploy
```

## Tech Stack

- **Runtime:** Node.js 22
- **Language:** TypeScript
- **Framework:** Express 5
- **Database:** Google BigQuery
- **Deployment:** Fly.io (Docker)

