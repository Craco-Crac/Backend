import { Router } from 'express';
import { createRoom, startRound } from '../controllers/roomController';

const router = Router();

router.post('/create', createRoom);
router.post('/start/:id', startRound);
export default router;
