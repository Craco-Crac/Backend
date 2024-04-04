import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { docs, getAllUsers, addUser, deleteUser } from '../controllers/userController';
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
router.delete('/delete/:username', deleteUser);

// router.delete('/:userId', deleteUser);

export default router;
