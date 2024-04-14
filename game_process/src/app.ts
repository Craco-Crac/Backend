import express, { Express } from 'express';
import roomRoutes from '@/routes/roomRoutes';
import cors from 'cors';
const app: Express = express();

app.use(express.json());
app.use(cors());

app.use('/game', roomRoutes);

export default app;