import 'dotenv/config'; // Loads environment variables from .env file
import express from 'express';
import cors from 'cors';
import bfhlRoutes from './routes/bfhlRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow these methods
  allowedHeaders: ['Content-Type'] 
})); 
app.use(express.json());

// Routes
app.use('/bfhl', bfhlRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;