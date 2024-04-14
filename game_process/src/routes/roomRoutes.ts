import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { createRoom, startRound, deleteRoom } from '@/controllers/roomController';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = Router();

const swaggerDocument = YAML.load(path.join(__dirname, '../../api-docs.yml'));

// Serve swagger
router.use('/docs',
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.originalUrl == "/docs") return res.redirect('docs/')
        next()
    }, swaggerUi.serve, swaggerUi.setup(swaggerDocument));


router.post('/create', createRoom);
router.post('/start/:roomId', startRound);
router.delete('/delete/:roomId', deleteRoom);
export default router;
