import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api', aiRoutes);

// Start Server Without Database
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
