import { Hono } from "hono";
import { restaurantController } from "../controllers/restaurant.controller";

const router = new Hono();

router.get("/", restaurantController.getAll);
router.get("/:id", restaurantController.getById);
router.post("/", restaurantController.create);
router.put("/:id", restaurantController.update);
router.delete("/:id", restaurantController.delete);

export default router;