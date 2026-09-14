import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div>
        <h2>ClinicFlow</h2>

        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>

        <nav>
          {(user?.role === "admin" ||
            user?.role === "receptionist") && (
            <>
              <Link to="/dashboard">
                Dashboard
              </Link>

              <Link to="/patients">
                Patients
              </Link>

              <Link to="/appointments">
                Appointments
              </Link>

              <Link to="/invoices">
                Invoices
              </Link>
            </>
          )}
          {user?.role === "admin" && (
  <Link to="/staff">
    Staff
  </Link>
)}

          {user?.role === "doctor" && (
            <>
              <Link to="/appointments">
                My Appointments
              </Link>

              <Link to="/patients">
                Patients
              </Link>
            </>
          )}
        </nav>
      </div>

      <button
        className="logout-button"
        onClick={logout}
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;