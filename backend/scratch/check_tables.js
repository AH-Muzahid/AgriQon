const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: "postgresql://postgres.kqshvuccvepdmhxswqmb:8EqikC94w7xWWcuu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
  });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(res.rows.map(r => r.table_name));
  await client.end();
}

check().catch(console.error);
