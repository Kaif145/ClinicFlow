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
    <div className="auth-page">
      <div className="auth-card">
        <h1>ClinicFlow</h1>

        <h2>Welcome Back</h2>

        <p>
          Login to manage your clinic
        </p>

        {error && (
          <p className="error">{error}</p>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p>
          New clinic?{" "}
          <Link to="/register">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;