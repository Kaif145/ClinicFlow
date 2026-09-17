import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const user = response.data.user;

    localStorage.setItem(
      "token",
      response.data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    if (user.role === "doctor") {
      navigate("/appointments");
    } else {
      navigate("/dashboard");
    }

  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Login failed"
    );
  }
};

 return (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div
      className="card border-0 shadow-sm p-4"
      style={{ width: "100%", maxWidth: "420px" }}
    >
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">
          ClinicFlow
        </h2>

        <p className="text-muted mb-0">
          Sign in to your account
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">
            Email
          </label>

          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
        >
          Login
        </button>
      </form>
    </div>
  </div>
);
}

export default Login;