import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
function Patients() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatients(response.data.patients || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));

  const deletePatient = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchPatients();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete patient");
    }
  };
  return (
    <div>
      <h1>Patients</h1>
      <Link to="/patients/add">
        <button>Add Patient</button>
      </Link>

      {error && <p>{error}</p>}

      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.name}</td>
                <td>{patient.phone}</td>
                <td>{patient.email || "-"}</td>
                <td>{patient.gender || "-"}</td>
                <td>{patient.bloodGroup || "-"}</td>
                <td>
                  <Link to={`/patients/${patient._id}`}>
                    <button>View</button>
                  </Link>

                  {user?.role === "admin" && (
                    <button onClick={() => deletePatient(patient._id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Patients;
