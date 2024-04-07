import express, { Express } from 'express';
import roomRoutes from './routes/roomRoutes';

const app: Express = express();

app.use(express.json());
app.use('/game', roomRoutes);

export default app;