import { Hono } from "hono";
import { restaurantController } from "../controllers/restaurant.controller";
import { menuItemController } from "../controllers/menuItem.controller";

const router = new Hono();

router.get("/", restaurantController.getAll);
router.get("/:id", restaurantController.getById);
router.post("/", restaurantController.create);
router.put("/:id", restaurantController.update);
router.delete("/:id", restaurantController.delete);

router.get("/:id/menu_items", menuItemController.getByRestaurant);
router.post("/:id/menu_items", menuItemController.create);

export default router;