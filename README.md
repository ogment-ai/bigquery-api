# Big Query API

A Node.js Express API that provides a REST interface to Google BigQuery. Query any dataset, list tables, and explore schemas across all regions.

## ✨ Features

- 🔍 **Execute SQL queries** on any BigQuery dataset
- 📋 **Browse data catalog** - all datasets and tables in one call  
- 📊 **Get table schemas** with metadata
- 🔐 **API key authentication** on all query endpoints
- 🌍 **Multi-region support** - query US, EU, or any location
- 📚 **Swagger UI** for interactive API exploration

## 🚀 Quick Start

```bash
# Health check
curl https://big-query-api.fly.dev/health

# Get full catalog (requires API key)
curl https://big-query-api.fly.dev/query/catalog-datasets \
  -H 'Authorization: YOUR_API_KEY'

# Execute SQL query
curl -X POST https://big-query-api.fly.dev/query \
  -H 'Authorization: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"sql": "SELECT 1 as test"}'
```

## 📖 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| GET | `/api-docs` | Swagger UI documentation | No |
| GET | `/api-docs.json` | OpenAPI JSON spec | No |
| POST | `/query` | Execute SQL query | **Yes** |
| GET | `/query/catalog-datasets` | List all datasets with their tables | **Yes** |
| GET | `/query/tables/:datasetId/:tableId/schema` | Get table schema | **Yes** |

### POST /query

Execute a SQL query against BigQuery.

**Request body:**
```json
{
  "sql": "SELECT * FROM `project.dataset.table` LIMIT 10",
  "maxRows": 1000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sql` | string | Yes | SQL query to execute |
| `maxRows` | number | No | Max rows to return (default: 1000, max: 10000) |

## 🔌 Ogment Integration

Use this API with [Ogment](https://ogment.io) or any OpenAPI-compatible tool.

**OpenAPI JSON URL:**
```
https://big-query-api.fly.dev/api-docs.json
```

**Authentication:**  
All `/query/*` endpoints require an `Authorization` header with your API key:

```
Authorization: YOUR_API_KEY
```

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GCP_PROJECT_ID` | Yes | Google Cloud project ID |
| `GCP_CREDENTIALS_JSON` | Yes | Service account JSON (single line) |
| `GCP_LOCATION` | No | BigQuery location (auto-detects if not set) |
| `API_KEY` | Yes | API key for authentication |
| `PRODUCTION_URL` | No | Base URL for OpenAPI spec |
| `ALLOWED_ORIGINS` | No | CORS allowed origins (comma-separated) |
| `SWAGGER_TOKEN` | No | Token to protect `/api-docs.json` |

## 🛠️ Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.template .env
# Edit .env with your values
```

### 3. Configure GCP credentials

```bash
# Convert service account JSON to single line
cat service-account.json | jq -c . 

# Or if using nested format from Supabase
cat service-account-key.json | jq -r '.BIGQUERY_KEY_CONTENT' | jq -c .
```

### 4. Run development server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## 🚢 Deployment (Fly.io)

```bash
# Set secrets
fly secrets set API_KEY='your-api-key'
fly secrets set GCP_PROJECT_ID='your-project-id'
fly secrets set GCP_CREDENTIALS_JSON="your-gcp-creds"
fly secrets set PRODUCTION_URL='https://your-app.fly.dev'

# Deploy
fly deploy
```

## 📁 Project Structure

```
src/
├── main.ts           # Server entry point
├── app.ts            # Express app setup
├── lib/
│   ├── bigquery.ts   # BigQuery client
│   └── swagger.ts    # OpenAPI config
├── middelware/
│   └── auth.ts       # API key authentication
└── routes/
    └── query.ts      # Query endpoints
```

## 🛡️ Security

- API key required for all query endpoints
- Rate limiting (100 requests per minute)
- Helmet security headers
- Configurable CORS origins
- Optional Swagger docs protection

## 📦 Tech Stack

- **Runtime:** Node.js 22
- **Language:** TypeScript
- **Framework:** Express 5
- **Validation:** Zod
- **Database:** Google BigQuery
- **Deployment:** Fly.io
