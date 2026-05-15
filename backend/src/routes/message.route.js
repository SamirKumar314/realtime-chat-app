import { Router } from "express";
import { verifyRoute } from "../middlewares/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.get("/users", verifyRoute, getUsersForSidebar);

router.get("/:id", verifyRoute, getMessages);

router.post("/send/:id", verifyRoute, sendMessage);

export default router;
