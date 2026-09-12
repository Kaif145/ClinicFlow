import Visit from "../models/Visit.js";
import Appointment from "../models/Appointment.js";

export const createVisit = async (req, res) => {
  try {
    const {
      appointmentId,
      complaint,
      consultationNotes,
      treatment,
      followUpDate,
    } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: "Appointment ID is required",
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Doctor can only create visit for their own appointment
    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You cannot create a visit for another doctor's patient",
      });
    }

    // Patient should normally be checked in first
    if (appointment.status !== "checked-in") {
      return res.status(400).json({
        message: "Patient must be checked-in before consultation",
      });
    }

    // Prevent duplicate visit
    const existingVisit = await Visit.findOne({
      appointment: appointmentId,
    });

    if (existingVisit) {
      return res.status(400).json({
        message: "Visit record already exists for this appointment",
      });
    }

    const visit = await Visit.create({
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      complaint,
      consultationNotes,
      treatment,
      followUpDate,
    });

    // Consultation finished
    appointment.status = "completed";
    await appointment.save();

    const populatedVisit = await Visit.findById(visit._id)
      .populate("patient", "name phone gender dateOfBirth bloodGroup")
      .populate("doctor", "name email")
      .populate("appointment", "date tokenNumber status");

    res.status(201).json({
      message: "Visit record created successfully",
      visit: populatedVisit,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getPatientVisits = async (req, res) => {
  try {
    const visits = await Visit.find({
      patient: req.params.patientId,
    })
      .populate("doctor", "name email")
      .populate("appointment", "date tokenNumber status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      visits,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};