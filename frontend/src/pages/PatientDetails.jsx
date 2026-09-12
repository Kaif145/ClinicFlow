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
    <div>
      <h1>{patient.name}</h1>

      <p>Phone: {patient.phone}</p>
      <p>Email: {patient.email || "-"}</p>
      <p>Gender: {patient.gender || "-"}</p>
      <p>
        Blood Group:
        {patient.bloodGroup || "-"}
      </p>

      <hr />

      <h2>Visit History</h2>

      {visits.length === 0 ? (
        <p>No visit history.</p>
      ) : (
        visits.map((visit) => (
          <div key={visit._id}>
            <h3>
              {new Date(
                visit.createdAt
              ).toLocaleDateString()}
            </h3>

            <p>
              Doctor:
              {visit.doctor?.name}
            </p>

            <p>
              Complaint:
              {visit.complaint || "-"}
            </p>

            <p>
              Treatment:
              {visit.treatment || "-"}
            </p>

            <p>
              Notes:
              {visit.consultationNotes || "-"}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default PatientDetails;