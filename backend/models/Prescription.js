import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
      required: true,
      unique: true,
    },

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

    medicines: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        dosage: {
          type: String,
          trim: true,
        },

        frequency: {
          type: String,
          trim: true,
        },

        duration: {
          type: String,
          trim: true,
        },

        instructions: {
          type: String,
          trim: true,
        },
      },
    ],

    generalInstructions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model(
  "Prescription",
  prescriptionSchema
);

export default Prescription;