import express from 'express';
import {
  listarFontesController,
  buscarVagasController,
  buscarPorFonteController,
} from './buscas.controller.js';

const router = express.Router();

router.get('/fontes', listarFontesController);
router.post('/', buscarVagasController);
router.post('/fonte/:fonte', buscarPorFonteController);

export default router;
