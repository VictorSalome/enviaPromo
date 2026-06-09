import { Router } from "express";
import * as filterController from "./filter.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, filterController.list);
router.get("/stats", requireAuth, filterController.getStats);
router.post("/categories", requireAuth, filterController.createCategory);
router.post("/", requireAuth, filterController.createFilter);
router.post("/toggle-all", requireAuth, filterController.toggleAll);
router.post("/:id/toggle", requireAuth, filterController.toggle);
router.delete("/:id", requireAuth, filterController.remove);

export default router;
