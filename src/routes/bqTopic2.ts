import { Router } from 'express';

const router = Router();

async function query() {
  //do anything you want here
  return "test_query_topic_2_results";
}

router.get('/query', async (req, res) => {
  const result = await query();
  res.json({ message: result });
});

export default router;