import 'dotenv/config';
import express from 'express';
import bigQueryTopic1Router from './routes/bqTopic1.js';

const app = express();
app.use(express.json());
app.use('/bqTopic1', bigQueryTopic1Router);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/health', (req, res) => {
  res.json({ message: 'The API is healthy!' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});