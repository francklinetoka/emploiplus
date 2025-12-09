// backend/src/routes/auth.routes.ts
import { Router } from "express";
import { loginAdmin, registerAdmin } from "../controllers/auth.controller";

const router = Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin); // inscription admin

export default router;