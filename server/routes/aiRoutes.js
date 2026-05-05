import express from 'express';
import { getReading, moderateQuestion } from '../controllers/aiController.js';

const router = express.Router();

router.post('/read', getReading);
router.post('/moderate', moderateQuestion);

export default router;
