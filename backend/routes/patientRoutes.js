import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/addpatient",
  protect,
  allowRoles("receptionist", "admin"),
  createPatient,
);

router.get(
  "/patients",
  protect,
  allowRoles("receptionist", "admin", "doctor"),
  getPatients,
);
router.get(
  "/:id",
  protect,
  allowRoles("admin", "doctor", "receptionist"),
  getPatientById,
);
router.put("/:id", protect, allowRoles("admin", "receptionist"), updatePatient);

router.delete("/:id", protect, allowRoles("admin"), deletePatient);
export default router;
