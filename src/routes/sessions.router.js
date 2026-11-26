import { Router } from 'express';
import { current, login, logout, register } from '../controllers/sessions.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current', authenticate, current);
router.post('/logout', logout);

export default router;
