import express from 'express';
import { getAllUsers} from '../controllers/userController';
import { getSchemas, getTables } from '../controllers/dbController';
const router = express.Router();

// router.post('/', createUser);
// router.get('/:userId', getUser);
router.get('/all', getAllUsers);

router.get('/schemas', getSchemas);
router.get('/tables', getTables);

// router.delete('/:userId', deleteUser);

export default router;