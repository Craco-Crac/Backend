import express, { Express } from 'express';
import userRoutes from './routes/userRoutes';
import cors from 'cors';

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use('/users', userRoutes);

export default app;
