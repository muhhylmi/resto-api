import { Hono } from "hono";
import { authController } from "../controllers/auth.controller";

const router = new Hono();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;