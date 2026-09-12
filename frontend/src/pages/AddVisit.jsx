import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AddVisit() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    complaint: "",
    consultationNotes: "",
    treatment: "",
    followUpDate: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      await api.post(
        "/visits",
        {
          appointmentId,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/appointments");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create visit"
      );
    }
  };

  return (
    <div>
      <h1>Create Visit</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          name="complaint"
          placeholder="Complaint"
          value={formData.complaint}
          onChange={handleChange}
        />

        <textarea
          name="consultationNotes"
          placeholder="Consultation Notes"
          value={formData.consultationNotes}
          onChange={handleChange}
        />

        <textarea
          name="treatment"
          placeholder="Treatment"
          value={formData.treatment}
          onChange={handleChange}
        />

        <input
          type="date"
          name="followUpDate"
          value={formData.followUpDate}
          onChange={handleChange}
        />

        <button type="submit">
          Complete Visit
        </button>
      </form>
    </div>
  );
}

export default AddVisit;