import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function CreatePrescription() {
  const { visitId } = useParams();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  const [generalInstructions, setGeneralInstructions] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMedicineChange = (
    index,
    field,
    value
  ) => {
    const updatedMedicines = [...medicines];

    updatedMedicines[index][field] = value;

    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;

    const updatedMedicines = medicines.filter(
      (_, medicineIndex) =>
        medicineIndex !== index
    );

    setMedicines(updatedMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await api.post(
        "/prescriptions",
        {
          visitId,
          medicines,
          generalInstructions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const prescriptionId =
        response.data.prescription._id;

      navigate(
        `/prescriptions/${prescriptionId}`
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create prescription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Create Prescription
        </h2>

        <p className="text-muted">
          Add medicines and instructions for the patient.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card border-0 shadow-sm"
      >
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">
            Medicines
          </h5>

          {medicines.map(
            (medicine, index) => (
              <div
                key={index}
                className="border rounded-3 p-3 mb-3"
              >
                <div className="d-flex justify-content-between mb-3">
                  <strong>
                    Medicine {index + 1}
                  </strong>

                  {medicines.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        removeMedicine(index)
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Medicine Name
                    </label>

                    <input
                      className="form-control"
                      value={medicine.name}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Paracetamol 500mg"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Dosage
                    </label>

                    <input
                      className="form-control"
                      value={medicine.dosage}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "dosage",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 1 tablet"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">
                      Frequency
                    </label>

                    <input
                      className="form-control"
                      value={medicine.frequency}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "frequency",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Twice daily"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">
                      Duration
                    </label>

                    <input
                      className="form-control"
                      value={medicine.duration}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 5 days"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">
                      Instructions
                    </label>

                    <input
                      className="form-control"
                      value={
                        medicine.instructions
                      }
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "instructions",
                          e.target.value
                        )
                      }
                      placeholder="e.g. After food"
                    />
                  </div>
                </div>
              </div>
            )
          )}

          <button
            type="button"
            className="btn btn-outline-primary mb-4"
            onClick={addMedicine}
          >
            + Add Another Medicine
          </button>

          <div className="mb-3">
            <label className="form-label">
              General Instructions
            </label>

            <textarea
              className="form-control"
              rows="4"
              value={generalInstructions}
              onChange={(e) =>
                setGeneralInstructions(
                  e.target.value
                )
              }
              placeholder="Diet, rest, precautions, follow-up instructions..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePrescription;