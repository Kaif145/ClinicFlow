import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      // 10:00
    },

    endTime: {
      type: String,
      required: true,
      // 17:00
    },

    averageConsultationMinutes: {
      type: Number,
      default: 15,
      min: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

doctorAvailabilitySchema.index(
  {
    doctor: 1,
    dayOfWeek: 1,
  },
  {
    unique: true,
  }
);

const DoctorAvailability = mongoose.model(
  "DoctorAvailability",
  doctorAvailabilitySchema
);

export default DoctorAvailability;