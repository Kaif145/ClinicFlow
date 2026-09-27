import express from "express";
import { createAppointment ,getMyAppointments,getAllAppointments,updateAppointmentStatus,getAppointmentById} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("admin", "receptionist"),
  createAppointment
);
router.get(
  "/:id",
  protect,
  allowRoles("admin", "receptionist", "doctor"),
  getAppointmentById
);

// ✅ Add this
router.get(
  "/",
  protect,
  allowRoles("admin", "receptionist", "doctor"),
  getAllAppointments
);

router.get(
  "/my",
  protect,
  allowRoles("doctor"),
  getMyAppointments
);
router.get("/all",protect,allowRoles("admin","receptionist"),getAllAppointments);


router.patch(
  "/:id/status",
  protect,
  allowRoles("admin", "doctor", "receptionist"),
  updateAppointmentStatus
);


export default router;