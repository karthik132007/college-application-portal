import { Router } from "express";
import { getSlots, createSlot, deleteSlot } from "../controllers/examSlot.controller.js";

const router = Router();

router.get("/", getSlots);
router.post("/", createSlot);
router.delete("/:id", deleteSlot);

export default router;
