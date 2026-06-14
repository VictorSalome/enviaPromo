import { Router } from 'express';
import * as monitorController from './monitor.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.get('/status', requireAuth, monitorController.getStatus);
router.post('/start', requireAuth, monitorController.start);
router.post('/stop', requireAuth, monitorController.stop);
router.post('/force-check', requireAuth, monitorController.forceCheck);

export default router;
