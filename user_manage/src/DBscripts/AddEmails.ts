import pool from '../db'; 
async function addEmailColumn() {
    try {
      await pool.query('BEGIN');
  
      // Step 1: Add the email column without constraints
      await pool.query('ALTER TABLE users.credentials ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
  
      // Step 2: Update existing rows with a placeholder or unique email, ensure these are unique!
      await pool.query("UPDATE users.credentials SET email = 'temp_email_' || id || '@example.com' WHERE email IS NULL OR email = ''");
  
      // Step 3: Apply the UNIQUE and NOT NULL constraints
      await pool.query('ALTER TABLE users.credentials ALTER COLUMN email SET NOT NULL');
      await pool.query('ALTER TABLE users.credentials ADD CONSTRAINT email_unique UNIQUE (email)');
  
      await pool.query('COMMIT');
      console.log('Email column added successfully with UNIQUE and NOT NULL constraints.');
    } catch (err: any) { //eslint-disable-line
      await pool.query('ROLLBACK');
      console.error('Error executing query', err.stack);
    } finally {
      pool.end(); // Close the pool connection
    }
  }
  
  addEmailColumn();