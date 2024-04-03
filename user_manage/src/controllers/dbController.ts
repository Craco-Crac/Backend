import { Request, Response } from 'express';
import pool from '../db';

export const getSchemas = async (req: Request, res: Response) => { // eslint-disable-line
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT schema_name FROM information_schema.schemata;');
        console.log("Schemas:", result.rows);
    } catch (error) {
        console.error('Error fetching schemas:', error);
    } finally {
        client.release();
    }
}

export const getTables = async (req: Request, res: Response) => { // eslint-disable-line
    const client = await pool.connect();
    try {

        const schemas = await client.query('SELECT schema_name FROM information_schema.schemata;');

        for (const schema of schemas.rows) {
            const schemaName = schema.schema_name;
            const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1;`, [schemaName]);

            console.log(`Tables in schema '${schemaName}':`, tablesResult.rows);
        }
    } catch (error) {
        console.error('Error fetching tables in schemas:', error);
    } finally {
        client.release();
    }
}