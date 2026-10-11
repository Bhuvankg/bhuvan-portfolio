require('dotenv').config();
const { initDatabase } = require('../src/config/db');

async function main() {
  console.log('--- Running GradeAI Database Initialization & Seed ---');
  await initDatabase();
  console.log('--- Database Initialization Complete ---');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed runner failed:', err);
  process.exit(1);
});
