import { Request, Response, NextFunction } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
// export const createUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to create a user
// };

// export const getUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to get a user
// };

// Serve swagger
export const docs = async (req: Request, res: Response, next: NextFunction) => {
    console.log("hehe")
    if (req.originalUrl == "/docs") return res.redirect('docs/')
    next()
};

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

export const addUser = async (req: Request, res: Response) => { // eslint-disable-line
    const password = req.body.password;
    const username = req.body.username;
    if (!password) {
        res.status(400).json({ message: "Password is required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('add user');
    try {
        const client = await pool.connect();
        try {

            const insertQuery = `
          INSERT INTO users.credentials (username, password)
          VALUES ($1, $2)
          RETURNING id;`;


            const ans = await client.query(insertQuery, [username, hashedPassword]);
            console.log("New user added with ID:", ans.rows[0].id);
            res.status(201).send({ id: ans.rows[0].id, message: "User added successfully" });
        } catch (error) {
            console.error('Error adding user:', error);
            if (client) {
                client.release();
            }
            if (error && (error as Record<string, string>)?.code === '23505') {
                res.status(409).send({ message: "Username already exists" });
            } else {
                res.status(500).send({ message: "An error occurred while adding the user" });
            }
        } finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error adding user:', error);
        res.status(500).send({ message: "An error occurred while whilte connecting to DB" })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const { username } = req.params;

    console.log('Deleting user:', username);
    try {
        const client = await pool.connect();
        try {

            const userCheckResult = await client.query('SELECT FROM users.credentials WHERE username = $1', [username]);
            if (userCheckResult.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const deleteQuery = 'DELETE FROM users.credentials WHERE username = $1 RETURNING id;';
            const deleteResult = await client.query(deleteQuery, [username]);

            if (deleteResult.rowCount) {
                console.log(`User deleted successfully: ${username}`);
                res.status(200).json({ message: "User deleted successfully", username });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: "An error occurred while deleting the user" });
        } finally {
            if (client) {
                client.release();
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: "An error occurred while connecting to DB" })
    }
};

// eslint-disable-next-line
// export const deleteUser = (req: Request, res: Response) => {
//     // Logic to delete a user
// };
