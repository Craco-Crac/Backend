import pool from '../db';

async function createSchemaAndTables() {
  const client = await pool.connect();

  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS users;');

    const createCredentialsTableText = `
      CREATE TABLE IF NOT EXISTS users.credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `;

    await client.query(createCredentialsTableText);
    console.log("Schema 'users' and table 'credentials' created successfully.");
  } catch (error) {
    console.error('Error creating schema or tables:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

createSchemaAndTables();
