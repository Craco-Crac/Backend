import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { docs, getAllUsers, addUser, deleteUser, login, authCheck } from '../controllers/userController';
import { getSchemas, getTables } from '../controllers/dbController';
const router = express.Router();

const swaggerDocument = YAML.load(path.join(__dirname, '../../api-docs.yml'));

// Serve swagger
router.use('/docs', docs, swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// router.post('/', createUser);
// router.get('/:userId', getUser);
router.get('/all', getAllUsers);

router.get('/schemas', getSchemas);
router.get('/tables', getTables);

router.post('/add', addUser);
router.delete('/:username', deleteUser);

router.post('/login', login);
router.get('/logout', (req, res) => {
    res.clearCookie('authToken', { httpOnly: true, secure: true });
    res.status(200).json({ message: 'Logged out successfully' });
});
router.get('/auth/check', authCheck);
export default router;
