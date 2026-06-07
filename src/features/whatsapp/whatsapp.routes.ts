import { Router } from 'express';
import * as whatsappController from './whatsapp.controller.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();

router.post('/test', requireAuth, whatsappController.testWhatsApp);
router.post('/send', requireAuth, whatsappController.sendManual);

export default router;
