import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';


const app = express();
const port = 3000;

// Generate swagger specification
const swaggerDocument = YAML.load(path.join(__dirname, '../api-docs.yml'));

// Serve swagger
app.use('/docs', (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl == "/api-docs") return res.redirect('api-docs/')
  next()
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

interface User {
  id: number;
  name: string;
  email: string;
}

// Mock data for demonstration purposes
const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
];

// GET /users route
app.get('/users', (req: Request, res: Response) => {
  res.status(200).json(users);
});

// GET /users/:id route
app.get('/users/:id', (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);
  const user: User | undefined = users.find(user => user.id === id);

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.status(200).json(user);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
