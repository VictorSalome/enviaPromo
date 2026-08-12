import express from "express";
import {
  listarFontesController,
  buscarVagasController,
  buscarPorFonteController,
  autoApplyController,
  schedulerStatusController,
  schedulerStartController,
  schedulerStopController,
  schedulerRunNowController,
  linkedinParseController,
} from "./buscas.controller.js";

const router = express.Router();

// Busca
router.get("/fontes", listarFontesController);
router.post("/", buscarVagasController);
router.post("/fonte/:fonte", buscarPorFonteController);
router.post("/auto-apply", autoApplyController);

// Scheduler
router.get("/scheduler", schedulerStatusController);
router.post("/scheduler/start", schedulerStartController);
router.post("/scheduler/stop", schedulerStopController);
router.post("/scheduler/run", schedulerRunNowController);

// LinkedIn
router.post("/linkedin", linkedinParseController);

export default router;
