import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// POST /api/users/register - Register new applicant
router.post('/register', registerUser);

export default router;