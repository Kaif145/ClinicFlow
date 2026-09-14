import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddPatient() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bloodGroup: "",
  });

  const [error, setError] = useState("");

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

     await api.post("/patients", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      navigate("/patients");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create patient"
      );
    }
  };

  return (
    <div>
      <h1>Add Patient</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>

          <input
            type="text"
            name="name"
            placeholder="Patient name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Phone</label>

          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Date of Birth</label>

          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Gender</label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label>Address</label>

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Blood Group</label>

          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <button type="submit">
          Add Patient
        </button>
      </form>
    </div>
  );
}

export default AddPatient;