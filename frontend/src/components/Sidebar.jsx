import { NavLink, useNavigate } from "react-router-dom";

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

  const linkClass = ({ isActive }) =>
    `nav-link rounded-3 px-3 py-2 mb-1 ${
      isActive
        ? "bg-primary text-white"
        : "text-dark"
    }`;

  return (
    <aside
      className="bg-white border-end position-fixed top-0 start-0 vh-100 p-3"
      style={{
        width: "250px",
        zIndex: 1000,
      }}
    >
      <div className="d-flex flex-column h-100">
        {/* Logo */}
        <div className="mb-4">
          <h3 className="fw-bold text-primary mb-1">
            ClinicFlow
          </h3>

          <small className="text-muted">
            Clinic Management
          </small>
        </div>

        {/* Logged in user */}
        <div className="card border-0 bg-light mb-4">
          <div className="card-body p-3">
            <div className="fw-semibold">
              {user?.name || "User"}
            </div>

            <small className="text-muted text-capitalize">
              {user?.role}
            </small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav flex-column flex-grow-1">
          {(user?.role === "admin" ||
            user?.role === "receptionist") && (
            <>
              <NavLink
                to="/dashboard"
                className={linkClass}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/patients"
                className={linkClass}
              >
                Patients
              </NavLink>

              <NavLink
                to="/appointments"
                className={linkClass}
              >
                Appointments
              </NavLink>

              <NavLink
                to="/invoices"
                className={linkClass}
              >
                Invoices
              </NavLink>
              <NavLink
                  to="/follow-ups"
                  className={linkClass}
                >
                  Follow-ups
                </NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <NavLink
              to="/staff"
              className={linkClass}
            >
              Staff
            </NavLink>
          )}

          {user?.role === "doctor" && (
            <>
              <NavLink
                to="/appointments"
                className={linkClass}
              >
                My Appointments
              </NavLink>

              <NavLink
                to="/patients"
                className={linkClass}
              >
                Patients
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout */}
        <button
          className="btn btn-outline-danger w-100 mt-3"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;