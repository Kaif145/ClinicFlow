import DoctorAvailability from "../models/DoctorAvailability.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

export const setDoctorAvailability = async (req, res) => {
  try {
    const {
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
    } = req.body;

    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const availability =
      await DoctorAvailability.findOneAndUpdate(
        {
          doctor: doctorId,
          dayOfWeek,
        },
        {
          doctor: doctorId,
          dayOfWeek,
          startTime,
          endTime,
          slotDuration: slotDuration || 30,
          isActive: true,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      message: "Doctor availability saved",
      availability,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    const dayOfWeek = selectedDate.getDay();

    const availability =
      await DoctorAvailability.findOne({
        doctor: doctorId,
        dayOfWeek,
        isActive: true,
      });

    if (!availability) {
      return res.status(200).json({
        slots: [],
        message: "Doctor is not available on this day",
      });
    }

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: {
        $nin: ["cancelled", "no-show"],
      },
    });

    const bookedTimes = appointments.map((appointment) => {
      const appointmentDate = new Date(appointment.date);

      return `${String(
        appointmentDate.getHours()
      ).padStart(2, "0")}:${String(
        appointmentDate.getMinutes()
      ).padStart(2, "0")}`;
    });

    const slots = [];

    let [startHour, startMinute] =
      availability.startTime
        .split(":")
        .map(Number);

    const [endHour, endMinute] =
      availability.endTime
        .split(":")
        .map(Number);

    let currentMinutes =
      startHour * 60 + startMinute;

    const endMinutes =
      endHour * 60 + endMinute;

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(
        currentMinutes / 60
      );

      const minutes =
        currentMinutes % 60;

      const time = `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(2, "0")}`;

      if (!bookedTimes.includes(time)) {
        slots.push(time);
      }

      currentMinutes +=
        availability.slotDuration;
    }

    return res.status(200).json({
      slots,
    });
  } catch (error) {
    console.log("SLOT ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getDoctorAvailabilityInfo = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00`);
    const dayOfWeek = selectedDate.getDay();

    const availability =
      await DoctorAvailability.findOne({
        doctor: doctorId,
        dayOfWeek,
        isActive: true,
      });

    if (!availability) {
      return res.status(404).json({
        message: "Doctor is not available on this day",
      });
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: {
        $nin: ["cancelled", "no-show"],
      },
    });

    const queueCount = appointments.length;

    const nextToken = queueCount + 1;

    const [startHour, startMinute] =
      availability.startTime
        .split(":")
        .map(Number);

    const startMinutes =
      startHour * 60 + startMinute;

    const estimatedMinutes =
      startMinutes +
      queueCount *
        availability.averageConsultationMinutes;

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

    return res.status(200).json({
      startTime: availability.startTime,
      endTime: availability.endTime,
      averageConsultationMinutes:
        availability.averageConsultationMinutes,
      queueCount,
      nextToken,
      estimatedTime,
    });
  } catch (error) {
    console.log("AVAILABILITY INFO ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};