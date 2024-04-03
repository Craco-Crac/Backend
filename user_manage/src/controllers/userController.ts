import { Request, Response } from 'express';
import pool from '../db';
// export const createUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to create a user
// };

// export const getUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to get a user
// };

export const getAllUsers = async (req: Request, res: Response) => { // eslint-disable-line
    try {
        const client = await pool.connect();
        try {
            const users = await client.query('SELECT * FROM "users"."credentials"');
            console.log("Got users:", users.rows);
            res.json(users.rows); // Use .json for JSON response
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: "An error occurred while fetching users. Please try again later." });
    }

};

// eslint-disable-next-line
// export const deleteUser = (req: Request, res: Response) => {
//     // Logic to delete a user
// };
