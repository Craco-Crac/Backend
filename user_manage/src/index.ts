import app from './app'; // Import the Express application
// import dotenv from 'dotenv';

// dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
