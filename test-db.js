import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://neondb_owner:npg_V7CydRe5IAUm@ep-damp-water-a1ys8vyu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current time:', res.rows[0].now);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
