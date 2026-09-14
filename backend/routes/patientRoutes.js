import express from "express";

import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatientCompletely,
} from "../controllers/patientController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("admin", "doctor", "receptionist"),
  getPatients
);

router.post(
  "/",
  protect,
  allowRoles("admin", "receptionist"),
  createPatient
);

router.get(
  "/:id",
  protect,
  allowRoles("admin", "doctor", "receptionist"),
  getPatientById
);

router.put(
  "/:id",
  protect,
  allowRoles("admin", "receptionist"),
  updatePatient
);
router.delete("/:id",protect,allowRoles("admin","receptionist"),deletePatientCompletely)

export default router;