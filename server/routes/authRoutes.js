import express from 'express';
import { register, login, getAllUsers, toggleBanUser, deleteUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);

export default router;
