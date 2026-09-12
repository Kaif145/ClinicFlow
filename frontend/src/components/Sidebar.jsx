import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div>
      <h2>ClinicFlow</h2>

      <p>
        {user?.name} — {user?.role}
      </p>

      <nav>
        {(user?.role === "admin" || user?.role === "receptionist") && (
          <>
            <Link to="/dashboard">
              <p>Dashboard</p>
            </Link>

            <Link to="/patients">
              <p>Patients</p>
            </Link>

            <Link to="/appointments">
              <p>Appointments</p>
            </Link>
            <Link to="/invoices">
              <p>Invoices</p>
            </Link>
          </>
        )}

        {user?.role === "doctor" && (
          <>
            <Link to="/appointments">
              <p>My Appointments</p>
            </Link>

            <Link to="/patients">
              <p>Patients</p>
            </Link>
          </>
        )}
      </nav>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Sidebar;
