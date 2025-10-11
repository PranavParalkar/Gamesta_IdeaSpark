// Simple script to POST a vote to the running dev server
require('dotenv').config();

const URL = process.env.APP_URL || 'http://localhost:3000';
const TOKEN = process.env.TEST_JWT || '';

async function run() {
  const res = await fetch(`${URL}/api/ideas/1/vote`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {})
    },
    body: JSON.stringify({ vote: 1 })
  });
  const text = await res.text();
  console.log('status', res.status);
  try { console.log('body', JSON.parse(text)); } catch (e) { console.log('body', text); }
}

run().catch(err => { console.error(err); process.exit(1); });
