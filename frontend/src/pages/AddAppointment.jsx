import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function AddAppointment() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    reason: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        const patientResponse = await api.get(
          "/patients/patients",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const doctorResponse = await api.get(
          "/auth/doctors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPatients(patientResponse.data.patients || []);
        setDoctors(doctorResponse.data.doctors || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load patients and doctors"
        );
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.post("/appointments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/appointments");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create appointment"
      );
    }
  };

  return (
    <div>
      <h1>Create Appointment</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Patient</label>

          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
          >
            <option value="">Select Patient</option>

            {patients.map((patient) => (
              <option
                key={patient._id}
                value={patient._id}
              >
                {patient.name}
              </option>
            ))}
          </select>

          <Link to="/patients/add">
            <button type="button">
              + Add New Patient
            </button>
          </Link>
        </div>

        <div>
          <label>Doctor</label>

          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Doctor
            </option>

            {doctors.map((doctor) => (
              <option
                key={doctor._id}
                value={doctor._id}
              >
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Date & Time</label>

          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Reason</label>

          <input
            name="reason"
            placeholder="Reason for appointment"
            value={formData.reason}
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          Create Appointment
        </button>
      </form>
    </div>
  );
}

export default AddAppointment;