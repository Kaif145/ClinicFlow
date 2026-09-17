import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function ViewPrescription() {
  const { id } = useParams();

  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrescription = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get(
          `/prescriptions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPrescription(
          response.data.prescription
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load prescription"
        );
      }
    };

    loadPrescription();
  }, [id]);

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-5">
        Loading prescription...
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-4">
        Prescription
      </h2>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h4>
            {prescription.patient?.name}
          </h4>

          <p className="text-muted">
            Dr. {prescription.doctor?.name}
          </p>

          <hr />

          <h5 className="fw-bold">
            Medicines
          </h5>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>

              <tbody>
                {prescription.medicines?.map(
                  (medicine, index) => (
                    <tr key={index}>
                      <td>{medicine.name}</td>
                      <td>{medicine.dosage}</td>
                      <td>{medicine.frequency}</td>
                      <td>{medicine.duration}</td>
                      <td>
                        {medicine.instructions}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <hr />

          <h6>General Instructions</h6>

          <p>
            {prescription.generalInstructions ||
              "No additional instructions"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ViewPrescription;