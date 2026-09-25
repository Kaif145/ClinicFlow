import Prescription from "../models/Prescription.js";
import Visit from "../models/Visit.js";

export const createPrescription = async (req, res) => {
  try {
    const {
      visitId,
      medicines,
      generalInstructions,
    } = req.body;

    const visit = await Visit.findById(visitId);

    if (!visit) {
      return res.status(404).json({
        message: "Visit not found",
      });
    }

    if (
      visit.doctor.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You can only prescribe for your own visit",
      });
    }

    const existing =
      await Prescription.findOne({
        visit: visitId,
      });

    if (existing) {
      return res.status(409).json({
        message:
          "Prescription already exists for this visit",
      });
    }

    const prescription =
      await Prescription.create({
        visit: visit._id,
        patient: visit.patient,
        doctor: visit.doctor,
        medicines,
        generalInstructions,
      });

    const result =
      await Prescription.findById(
        prescription._id
      )
        .populate(
          "patient",
          "name phone dateOfBirth gender"
        )
        .populate(
          "doctor",
          "name email phone"
        );

    return res.status(201).json({
      message:
        "Prescription created successfully",
      prescription: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getPatientPrescriptions = async (
  req,
  res
) => {
  try {
    const prescriptions =
      await Prescription.find({
        patient: req.params.patientId,
      })
        .populate("doctor", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json({
      prescriptions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate(
        "patient",
        "name phone gender dateOfBirth bloodGroup address"
      )
      .populate(
        "doctor",
        "name email phone"
      )
      .populate(
        "visit",
        "complaint consultationNotes treatment followUpDate createdAt"
      );

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      prescription,
    });
  } catch (error) {
    console.log("GET PRESCRIPTION ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};