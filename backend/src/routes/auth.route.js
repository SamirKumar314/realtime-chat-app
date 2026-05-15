import { Router } from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import {
  userLoginValidator,
  userSignupValidator,
} from "../validators/requestValidator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", userSignupValidator(), validate, signup);

router.post("/login", userLoginValidator(), validate, login);

router.post("/logout", logout);

//secure route
router.put("/update-profile", verifyRoute, updateProfile);

router.get("/check", verifyRoute, checkAuth);

export default router;
