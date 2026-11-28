import { Router } from 'express';
import { admin, current, login, logout, register } from '../controllers/sessions.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current', authenticate, current);
router.get('/admin', authenticate, authorize('admin'), admin);
router.post('/logout', logout);

export default router;
