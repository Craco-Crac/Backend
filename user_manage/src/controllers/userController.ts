import { Request, Response } from 'express';

// export const createUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to create a user
// };

// export const getUser = (req: Request, res: Response) => {// eslint-disable-line
//     // Logic to get a user
// };

export const getAllUsers = (req: Request, res: Response) => { // eslint-disable-line
    console.log('get all users');
    res.send('get all users');
};

// eslint-disable-next-line
// export const deleteUser = (req: Request, res: Response) => {
//     // Logic to delete a user
// };
