import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      reason,
    } = req.body;

    // 1. Check required fields
    if (!patientId || !doctorId || !date) {
      return res.status(400).json({
        message: "Patient, doctor and date are required",
      });
    }

    // 2. Check patient exists
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // 3. Check doctor exists
    const doctor = await User.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // 4. Make sure selected user is actually a doctor
    if (doctor.role !== "doctor") {
      return res.status(400).json({
        message: "Selected user is not a doctor",
      });
    }

    const appointmentDate = new Date(date);

    // 5. Create start and end of the appointment day
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 6. Find the latest token for this doctor on this day
    const lastAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ tokenNumber: -1 });

    // 7. Generate next token
    const tokenNumber = lastAppointment
      ? lastAppointment.tokenNumber + 1
      : 1;

    // 8. Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: appointmentDate,
      tokenNumber,
      reason,
      createdBy: req.user.userId,
    });

    // 9. Return result
    res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    // Duplicate token protection
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Appointment token conflict. Please try again.",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.user.userId,
    })
      .populate("patient", "name phone gender dateOfBirth")
      .populate("doctor", "name email")
      .sort({ date: 1, tokenNumber: 1 });

    res.status(200).json({
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const allAppointment = await Appointment.find()
      .populate("patient", "name phone gender")
      .populate("doctor", "name email")
      .populate("createdBy", "name role")
      .sort({ date: 1, tokenNumber: 1 });

    if (allAppointment.length === 0) {
      return res.status(200).json({
        message: "No appointments found",
        allAppointment: [],
      });
    }

    return res.status(200).json({
      allAppointment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
      "scheduled",
      "checked-in",
      "completed",
      "cancelled",
      "no-show",
    ];

    // Check valid status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Receptionist restrictions
    if (
      req.user.role === "receptionist" &&
      !["scheduled", "checked-in", "cancelled", "no-show"].includes(status)
    ) {
      return res.status(403).json({
        message: "Receptionist cannot set this status",
      });
    }

    // Doctor restrictions
    if (
      req.user.role === "doctor" &&
      !["checked-in", "completed"].includes(status)
    ) {
      return res.status(403).json({
        message: "Doctor cannot set this status",
      });
    }

    // Optional: doctor can update only their own appointment
    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You can only update your own appointments",
      });
    }

    appointment.status = status;

    await appointment.save();

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};