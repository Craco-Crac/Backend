import express from 'express';
import { getAllUsers } from '../controllers/userController';

const router = express.Router();

// router.post('/', createUser);
// router.get('/:userId', getUser);
router.get('/users', getAllUsers);
// router.delete('/:userId', deleteUser);

export default router;