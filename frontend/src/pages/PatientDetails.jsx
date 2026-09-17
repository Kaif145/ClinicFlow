import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const token = localStorage.getItem("token");

        const patientResponse = await api.get(
          `/patients/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPatient(
          patientResponse.data.patient
        );

        const user = JSON.parse(
          localStorage.getItem("user")
        );

        if (
          user?.role === "doctor" ||
          user?.role === "admin"
        ) {
          const visitResponse = await api.get(
            `/visits/patient/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setVisits(
            visitResponse.data.visits || []
          );
        }
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    loadPatient();
  }, [id]);

  if (!patient) {
    return <p>Loading patient...</p>;
  }

 return (
  <div className="container-fluid">
    {/* Header */}
    <div className="mb-4">
      <h2 className="fw-bold mb-1">
        Patient Details
      </h2>

      <p className="text-muted mb-0">
        Patient profile and visit history
      </p>
    </div>

    {/* Patient profile */}
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-4">
          <div
            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-4 me-3"
            style={{
              width: "60px",
              height: "60px",
            }}
          >
            {patient.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <h4 className="fw-bold mb-1">
              {patient.name}
            </h4>

            <span className="text-muted">
              Patient
            </span>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <small className="text-muted">
              Phone
            </small>

            <div className="fw-semibold">
              {patient.phone || "-"}
            </div>
          </div>

          <div className="col-md-4">
            <small className="text-muted">
              Email
            </small>

            <div className="fw-semibold">
              {patient.email || "-"}
            </div>
          </div>

          <div className="col-md-4">
            <small className="text-muted">
              Gender
            </small>

            <div className="fw-semibold text-capitalize">
              {patient.gender || "-"}
            </div>
          </div>

          <div className="col-md-4">
            <small className="text-muted">
              Blood Group
            </small>

            <div className="fw-semibold">
              {patient.bloodGroup || "-"}
            </div>
          </div>

          <div className="col-md-4">
            <small className="text-muted">
              Date of Birth
            </small>

            <div className="fw-semibold">
              {patient.dateOfBirth
                ? new Date(
                    patient.dateOfBirth
                  ).toLocaleDateString()
                : "-"}
            </div>
          </div>

          <div className="col-md-4">
            <small className="text-muted">
              Address
            </small>

            <div className="fw-semibold">
              {patient.address || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Visit History */}
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-0 py-3">
        <h5 className="fw-bold mb-0">
          Visit History
        </h5>
      </div>

      <div className="card-body">
        {visits.length === 0 ? (
          <div className="text-center py-5">
            <div className="fs-2 mb-2">
              🩺
            </div>

            <h6 className="fw-semibold">
              No visit history
            </h6>

            <p className="text-muted mb-0">
              Previous consultations will appear here.
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {visits.map((visit) => (
              <div
                className="col-12"
                key={visit._id}
              >
                <div className="border rounded-3 p-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold mb-1">
                        Consultation
                      </h6>

                      <small className="text-muted">
                        Dr.{" "}
                        {visit.doctor?.name ||
                          "-"}
                      </small>
                    </div>

                    <small className="text-muted">
                      {new Date(
                        visit.createdAt
                      ).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <small className="text-muted">
                        Complaint
                      </small>

                      <p className="mb-0">
                        {visit.complaint ||
                          "-"}
                      </p>
                    </div>

                    <div className="col-md-4">
                      <small className="text-muted">
                        Treatment
                      </small>

                      <p className="mb-0">
                        {visit.treatment ||
                          "-"}
                      </p>
                    </div>

                    <div className="col-md-4">
                      <small className="text-muted">
                        Notes
                      </small>

                      <p className="mb-0">
                        {visit.consultationNotes ||
                          "-"}
                      </p>
                    </div>
                  </div>

                  {visit.followUpDate && (
                    <div className="alert alert-info mt-3 mb-0 py-2">
                      Follow-up:{" "}
                      {new Date(
                        visit.followUpDate
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}

export default PatientDetails;