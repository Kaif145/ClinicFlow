import express from "express";

import {
  setDoctorAvailability,
  getAvailableSlots,
  getDoctorAvailabilityInfo
} from "../controllers/availabilityController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/doctor/:doctorId/info",
  protect,
  allowRoles("admin", "receptionist", "doctor"),
  getDoctorAvailabilityInfo
);

router.post(
  "/",
  protect,
  allowRoles("admin"),
  setDoctorAvailability
);

router.get(
  "/doctor/:doctorId",
  protect,
  allowRoles(
    "admin",
    "receptionist",
    "doctor"
  ),
  getAvailableSlots
);

export default router;