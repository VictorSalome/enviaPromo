import express from 'express';
import {
  listarFontesController,
  buscarVagasController,
  buscarPorFonteController,
  autoApplyController,
} from './buscas.controller.js';

const router = express.Router();

router.get('/fontes', listarFontesController);
router.post('/', buscarVagasController);
router.post('/fonte/:fonte', buscarPorFonteController);
router.post('/auto-apply', autoApplyController);

export default router;
