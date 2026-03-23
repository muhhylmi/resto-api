import { Hono } from "hono";
import { menuItemController } from "../controllers/menuItem.controller";

const router = new Hono();

router.put("/:id", menuItemController.update);
router.delete("/:id", menuItemController.delete);

export default router;