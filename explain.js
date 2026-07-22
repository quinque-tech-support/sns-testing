const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.rykqiqspuihwjlncncvz:jKzV8dWz3PBbGVpc@aws-1-ap-south-1.pooler.supabase.com:5432/postgres' // using direct URL to bypass pgbouncer for prepared statements or complex things, but both work
});

async function main() {
  const query1 = `
    EXPLAIN ANALYZE 
    SELECT "Schedule".* 
    FROM "Schedule" 
    JOIN "Post" ON "Schedule"."postId" = "Post"."id" 
    WHERE "Post"."userId" = 'some-real-user-id' 
      AND "Schedule"."status" = 'PENDING';
  `;

  const query2 = `
    EXPLAIN ANALYZE 
    SELECT * FROM "Post" WHERE "userId" = 'some-real-user-id';
  `;

  console.log("Running Query 1 (Schedule + Post):");
  try {
    const res1 = await pool.query(query1);
    console.log(res1.rows.map(r => r['QUERY PLAN']).join('\n'));
  } catch (e) { console.error(e); }

  console.log("\nRunning Query 2 (Post only):");
  try {
    const res2 = await pool.query(query2);
    console.log(res2.rows.map(r => r['QUERY PLAN']).join('\n'));
  } catch (e) { console.error(e); }

  pool.end();
}

main().catch(console.error);
