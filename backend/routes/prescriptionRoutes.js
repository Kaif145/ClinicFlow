import express from "express";

import {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
} from "../controllers/prescriptionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("doctor"),
  createPrescription
);
router.get(
  "/:id",
  protect,
  allowRoles("doctor", "admin"),
  getPrescriptionById
);

router.get(
  "/patient/:patientId",
  protect,
  allowRoles("doctor", "admin"),
  getPatientPrescriptions
);

export default router;