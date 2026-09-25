import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
// Create Appointment

export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      reason,
    } = req.body;

    // 1. Convert date
    const appointmentDate = new Date(date);

    // 2. Start and end of selected day
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Find last appointment for same doctor + same day
    const lastAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ tokenNumber: -1 });

    // 4. Generate token
    const tokenNumber = lastAppointment
      ? lastAppointment.tokenNumber + 1
      : 1;

    // 5. Get doctor availability
    const dayOfWeek = appointmentDate.getDay();

    const availability =
      await DoctorAvailability.findOne({
        doctor: doctorId,
        dayOfWeek,
        isActive: true,
      });

    if (!availability) {
      return res.status(400).json({
        message:
          "Doctor is not available on this day",
      });
    }

    // 6. Start time
    const [startHour, startMinute] =
      availability.startTime
        .split(":")
        .map(Number);

    const startMinutes =
      startHour * 60 + startMinute;

    // 7. Estimate patient time
    const estimatedMinutes =
      startMinutes +
      (tokenNumber - 1) *
        availability.averageConsultationMinutes;

    // 8. Check doctor end time
    const [endHour, endMinute] =
      availability.endTime
        .split(":")
        .map(Number);

    const endMinutes =
      endHour * 60 + endMinute;

    if (estimatedMinutes >= endMinutes) {
      return res.status(400).json({
        message:
          "Doctor's queue is full for this day",
      });
    }

    // 9. Convert estimated minutes → HH:MM
    const estimatedHour = Math.floor(
      estimatedMinutes / 60
    );

    const estimatedMinute =
      estimatedMinutes % 60;

    const estimatedTime = `${String(
      estimatedHour
    ).padStart(2, "0")}:${String(
      estimatedMinute
    ).padStart(2, "0")}`;

    // 10. Create appointment
    const appointment =
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        date: appointmentDate,
        tokenNumber,
        estimatedTime,
        reason,
        createdBy: req.user.userId,
      });

    return res.status(201).json({
      message:
        "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
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