import express, { Express } from 'express';
import userRoutes from './routes/userRoutes';

const app: Express = express();

app.use(express.json());

app.use('/users', userRoutes);

export default app;
