import Appointment from "../models/Appointment.js";
import Visit from "../models/Visit.js";
import Invoice from "../models/Invoice.js";
import Patient from "../models/Patient.js";
// Create Patient
export const createPatient = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      emergencyContact,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const patientData = {
      name,
      phone,
      createdBy: req.user.userId,
    };

    // Only add optional fields when they actually contain data
    if (email) patientData.email = email;
    if (dateOfBirth) patientData.dateOfBirth = dateOfBirth;
    if (gender) patientData.gender = gender;
    if (address) patientData.address = address;
    if (bloodGroup) patientData.bloodGroup = bloodGroup;

    if (
      emergencyContact &&
      (emergencyContact.name ||
        emergencyContact.phone ||
        emergencyContact.relation)
    ) {
      patientData.emergencyContact = emergencyContact;
    }

    const patient = await Patient.create(patientData);

    return res.status(201).json({
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    console.log("CREATE PATIENT ERROR:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};


// Get all patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
      isArchived: { $ne: true },
    })
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      patients,
    });
  } catch (error) {
    console.log("GET PATIENT ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "createdBy",
      "name role",
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json({
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res.status(404).json({
        message: "Patient Not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const deletePatientCompletely = async (
  req,
  res
) => {
  try {
    const patientId = req.params.id;

    const patient = await Patient.findById(
      patientId
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const appointments =
      await Appointment.find({
        patient: patientId,
      }).select("_id");

    const appointmentIds =
      appointments.map(
        (appointment) => appointment._id
      );

    await Visit.deleteMany({
      patient: patientId,
    });

    await Invoice.deleteMany({
      patient: patientId,
    });

    await Appointment.deleteMany({
      patient: patientId,
    });

    await Patient.findByIdAndDelete(
      patientId
    );

    return res.status(200).json({
      message:
        "Patient and related history deleted permanently",
      deletedAppointments:
        appointmentIds.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};