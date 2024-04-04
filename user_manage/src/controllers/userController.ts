import { Request, Response, NextFunction } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// export const createUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to create a user
// };

// export const getUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to get a user
// };

// Serve swagger
export const docs = async (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl == "/docs") return res.redirect('docs/')
    next()
};

export const getAllUsers = async (req: Request, res: Response) => { 
    try {
        const client = await pool.connect();
        try {
            const users = await client.query('SELECT * FROM "users"."credentials"');
            console.log("Got users:", users.rows);
            res.json(users.rows);
        }
        catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ message: "An error occurred while fetching users. Please try again later." });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send({ message: "An error occurred while whilte connecting to DB" })
    }

};

export const addUser = async (req: Request, res: Response) => { 
    const password = req.body.password;
    const username = req.body.username;
    const email = req.body.email;
    if (!password) {
        res.status(400).json({ message: "Password is required" });
    }
    if (!username) {
        res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
        res.status(400).json({ message: "Email is required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('add user');
    try {
        const client = await pool.connect();
        try {

            const insertQuery = `
          INSERT INTO users.credentials (username, password, email)
          VALUES ($1, $2, $3)
          RETURNING id;`;


            const ans = await client.query(insertQuery, [username, hashedPassword, email]);
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
    const param = req.params.username;

    console.log('Deleting user:', param);
    try {
        const client = await pool.connect();
        try {
            const inQuery = param.includes('@') ? 'email' : 'username';

            const userCheckResult = await client.query(`SELECT FROM users.credentials WHERE ${inQuery} = $1`, [param]);
            if (userCheckResult.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const deleteQuery = `DELETE FROM users.credentials WHERE ${inQuery} = $1 RETURNING id;`;
            const deleteResult = await client.query(deleteQuery, [param]);

            if (deleteResult.rowCount) {
                console.log(`User deleted successfully: ${param}`);
                res.status(200).json({ message: "User deleted successfully", param });
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

export const login = async (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const client = await pool.connect();
        try {
            const users = await client.query('SELECT password, id FROM users.credentials WHERE username = $1', [username]);
            if (users.rowCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            bcrypt.compare(password, users.rows[0].password, (error, result) => {
                if (error) {
                    console.log('Error in bcrypt', result);
                    res.status(500).json({ message: "An error occurred while verifying the password" });
                } else if (result) {
                    console.log('Password verified');
                    const token = jwt.sign({ "id": users.rows[0].id, "username": username },
                        'yourSecretKey', { expiresIn: '1h' });
                    console.log(token)
                    res.cookie('token', token, { httpOnly: true, secure: true });
                    res.status(200).json({ message: "Authenticated", "jwt": token });
                } else {
                    console.log('Password not verified');
                    res.status(401).json({ message: "Password is incorrect" });
                }
            });
        }
        catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ message: "An error occurred while fetching users. Please try again later." });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send({ message: "An error occurred while whilte connecting to DB" })
    }

};

// eslint-disable-next-line
// export const deleteUser = (req: Request, res: Response) => {
//     // Logic to delete a user
// };
