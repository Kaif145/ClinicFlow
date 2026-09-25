import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "checked-in", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },

    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    estimatedTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Same doctor + same day + same token cannot exist
appointmentSchema.index(
  { doctor: 1, date: 1, tokenNumber: 1 },
  { unique: true },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
