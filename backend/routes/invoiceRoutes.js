import express from "express";

import {
  createInvoice,
  getInvoices,
  addPayment,
} from "../controllers/invoiceController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("admin", "receptionist"),
  createInvoice
);

router.get(
  "/",
  protect,
  allowRoles("admin", "receptionist"),
  getInvoices
);

router.patch(
  "/:id/payment",
  protect,
  allowRoles("admin", "receptionist"),
  addPayment
);

export default router;