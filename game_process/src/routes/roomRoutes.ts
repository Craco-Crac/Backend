import { Router } from 'express';
import { createRoom } from '../controllers/roomController';

const router = Router();

router.post('/create', createRoom);

export default router;
