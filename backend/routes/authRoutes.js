import express from "express";

import {
  registerUser,
  loginUser,
  createStaff,
  getDoctors,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post(
  "/staff",
  protect,
  allowRoles("admin"),
  createStaff
);

router.get(
  "/doctors",
  protect,
  allowRoles("admin", "receptionist"),
  getDoctors
);

export default router;