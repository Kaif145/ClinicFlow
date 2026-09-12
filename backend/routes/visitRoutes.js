import express from "express";

import {
  createVisit,
  getPatientVisits,
} from "../controllers/visitController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("doctor"),
  createVisit
);

router.get(
  "/patient/:patientId",
  protect,
  allowRoles("doctor", "admin"),
  getPatientVisits
);

export default router;