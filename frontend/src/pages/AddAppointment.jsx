import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";



function AddAppointment() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
const [doctorInfo, setDoctorInfo] = useState(null);
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

        const patientResponse = await api.get("/patients", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

       const doctorResponse = await api.get("/auth/doctors", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

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

  const loadDoctorInfo = async () => {
  if (!formData.doctorId || !formData.date) {
    setDoctorInfo(null);
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await api.get(
      `/availability/doctor/${formData.doctorId}/info`,
      {
        params: {
          date: formData.date,
        },

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setDoctorInfo(response.data);
    setError("");
  } catch (error) {
    setDoctorInfo(null);

    setError(
      error.response?.data?.message ||
        "Unable to load doctor availability"
    );
  }
};
useEffect(() => {
  loadDoctorInfo();
}, [formData.doctorId, formData.date]);

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
  <div className="container-fluid">
    <div className="mb-4">
      <h2 className="fw-bold mb-1">
        Create Appointment
      </h2>

      <p className="text-muted mb-0">
        Book a patient with an available doctor
      </p>
    </div>

    {error && (
      <div className="alert alert-danger">
        {error}
      </div>
    )}

    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Patient */}
          <div className="mb-3">
            <label className="form-label">
              Patient
            </label>

            <select
              name="patientId"
              className="form-select"
              value={formData.patientId}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient._id}
                  value={patient._id}
                >
                  {patient.name}
                </option>
              ))}
            </select>

            <div className="mt-2">
              <Link
                to="/patients/add"
                className="btn btn-outline-primary btn-sm"
              >
                + Add New Patient
              </Link>
            </div>
          </div>

          {/* Doctor */}
          <div className="mb-3">
            <label className="form-label">
              Doctor
            </label>

            <select
              name="doctorId"
              className="form-select"
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

          {/* Date */}
          <div className="mb-3">
            <label className="form-label">
              Appointment Date
            </label>

            <input
              type="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Doctor availability */}
          {doctorInfo && (
            <div className="alert alert-primary">
              <div className="fw-bold mb-2">
                Doctor Schedule
              </div>

              <div className="row g-2">
                <div className="col-md-6">
                  Available:
                  <strong className="ms-1">
                    {doctorInfo.startTime} -{" "}
                    {doctorInfo.endTime}
                  </strong>
                </div>

                <div className="col-md-6">
                  Avg. consultation:
                  <strong className="ms-1">
                    ~
                    {
                      doctorInfo.averageConsultationMinutes
                    }{" "}
                    min
                  </strong>
                </div>

                <div className="col-md-6">
                  Current Queue:
                  <strong className="ms-1">
                    {doctorInfo.queueCount}
                  </strong>
                </div>

                <div className="col-md-6">
                  Your Token:
                  <strong className="ms-1">
                    #{doctorInfo.nextToken}
                  </strong>
                </div>

                <div className="col-12">
                  Estimated Consultation:
                  <strong className="ms-1">
                    {doctorInfo.estimatedTime}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mb-3">
            <label className="form-label">
              Reason
            </label>

            <textarea
              name="reason"
              className="form-control"
              rows="3"
              placeholder="Reason for appointment"
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
          >
            Create Appointment
          </button>
        </form>
      </div>
    </div>
  </div>
);
}

export default AddAppointment;