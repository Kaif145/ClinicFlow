import { useState } from "react";
import api from "../services/api";

function Staff() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "doctor",
  });

  const [message, setMessage] = useState("");
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

      const response = await api.post(
        "/auth/staff",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setError("");

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "doctor",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create staff account"
      );

      setMessage("");
    }
  };

  return (
    <div>
      <h1>Staff Management</h1>

      <p>Create Doctor or Receptionist accounts.</p>

      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>

        <div>
          <label>Phone</label>

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>

        <div>
          <label>Role</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="doctor">
              Doctor
            </option>

            <option value="receptionist">
              Receptionist
            </option>
          </select>
        </div>

        <button type="submit">
          Create Staff Account
        </button>
      </form>
    </div>
  );
}

export default Staff;