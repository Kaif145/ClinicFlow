import Invoice from "../models/Invoice.js";
import Appointment from "../models/Appointment.js";

export const createInvoice = async (req, res) => {
  try {
    const {
      appointmentId,
      services,
      paidAmount = 0,
      paymentMethod,
    } = req.body;

    if (!appointmentId || !services || services.length === 0) {
      return res.status(400).json({
        message: "Appointment and services are required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({
        message: "Appointment must be completed before billing",
      });
    }

    // Prevent duplicate invoice
    const existingInvoice = await Invoice.findOne({
      appointment: appointmentId,
    });

    if (existingInvoice) {
      return res.status(400).json({
        message: "Invoice already exists for this appointment",
      });
    }

    // Calculate total on backend
    const totalAmount = services.reduce((total, service) => {
      return total + service.price * (service.quantity || 1);
    }, 0);

    if (paidAmount > totalAmount) {
      return res.status(400).json({
        message: "Paid amount cannot be greater than total amount",
      });
    }

    let paymentStatus = "unpaid";

    if (paidAmount === totalAmount && totalAmount > 0) {
      paymentStatus = "paid";
    } else if (paidAmount > 0) {
      paymentStatus = "partial";
    }

    const invoice = await Invoice.create({
      patient: appointment.patient,
      appointment: appointment._id,
      services,
      totalAmount,
      paidAmount,
      paymentStatus,
      paymentMethod,
      createdBy: req.user.userId,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("patient", "name phone")
      .populate("appointment", "date tokenNumber")
      .populate("createdBy", "name role");

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: populatedInvoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("patient", "name phone")
      .populate("appointment", "date tokenNumber")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid payment amount is required",
      });
    }

    const pendingAmount =
      invoice.totalAmount - invoice.paidAmount;

    if (amount > pendingAmount) {
      return res.status(400).json({
        message: `Payment cannot exceed pending amount of ₹${pendingAmount}`,
      });
    }

    // Add payment
    invoice.payments.push({
      amount,
      method: paymentMethod,
      receivedBy: req.user.userId,
    });

    // Update total paid
    invoice.paidAmount += amount;

    // Update payment status
    if (invoice.paidAmount === invoice.totalAmount) {
      invoice.paymentStatus = "paid";
    } else if (invoice.paidAmount > 0) {
      invoice.paymentStatus = "partial";
    } else {
      invoice.paymentStatus = "unpaid";
    }

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate("patient", "name phone")
      .populate("createdBy", "name role")
      .populate("payments.receivedBy", "name role");

    res.status(200).json({
      message: "Payment added successfully",
      invoice: updatedInvoice,
      pendingAmount:
        updatedInvoice.totalAmount -
        updatedInvoice.paidAmount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};