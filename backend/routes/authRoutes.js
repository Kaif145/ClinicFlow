import express from "express";

import {
  registerUser,
  loginUser,
  getDoctors,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import { allowRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();
router.get(
  "/doctors",
  protect,
  allowRoles("admin", "receptionist"),
  getDoctors
);
router.post("/register", registerUser);

router.post("/login", loginUser);


export default router;