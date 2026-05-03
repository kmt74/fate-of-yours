import express from 'express';
import { addReading, getUserReadings, getAllReadings } from '../controllers/readingController.js';

const router = express.Router();

router.post('/', addReading);
router.get('/', getAllReadings);
router.get('/:email', getUserReadings); // Get readings by email

export default router;
