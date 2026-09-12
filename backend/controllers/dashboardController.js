import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import Visit from "../models/Visit.js";

export const getDashboard = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Total patients
    const totalPatients = await Patient.countDocuments();

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Checked-in patients
    const checkedInPatients = await Appointment.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "checked-in",
    });

    // Today's completed visits
    const completedVisits = await Visit.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Today's invoices
    const todayInvoices = await Invoice.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Today's revenue
    const todayRevenue = todayInvoices.reduce((total, invoice) => {
      return total + invoice.paidAmount;
    }, 0);

    // All invoices for pending payments
    const invoices = await Invoice.find();

    const pendingPayments = invoices.reduce((total, invoice) => {
      return total + (invoice.totalAmount - invoice.paidAmount);
    }, 0);

    // Today's appointment queue
    const appointmentQueue = await Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("patient", "name phone")
      .populate("doctor", "name")
      .sort({ tokenNumber: 1 });

    res.status(200).json({
      totalPatients,
      todayAppointments,
      checkedInPatients,
      completedVisits,
      todayRevenue,
      pendingPayments,
      appointmentQueue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};