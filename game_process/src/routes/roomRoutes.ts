import { Router } from 'express';
import { createRoom, startRound, deleteRoom } from '../controllers/roomController';

const router = Router();

router.post('/create', createRoom);
router.post('/start/:roomId', startRound);
router.delete('/delete/:roomId', deleteRoom);
export default router;
