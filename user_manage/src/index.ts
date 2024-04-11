import app from './app'; // Import the Express application
// import dotenv from 'dotenv';

// dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0',() => {
  console.log(`User-manager service listening on port ${PORT}`);
});
