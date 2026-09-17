import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [dashboardData, setDashboardData] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await api.get(
          "/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboardData(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Patients",
      value: dashboardData.totalPatients,
    },
    {
      title: "Today's Appointments",
      value: dashboardData.todayAppointments,
    },
    {
      title: "Checked In",
      value: dashboardData.checkedInPatients,
    },
    {
      title: "Completed Today",
      value: dashboardData.completedToday,
    },
    {
      title: "Pending Appointments",
      value: dashboardData.pendingAppointments,
    },
    {
      title: "Today's Revenue",
      value: `₹${dashboardData.todayRevenue || 0}`,
    },
    {
      title: "Monthly Revenue",
      value: `₹${dashboardData.monthlyRevenue || 0}`,
    },
    {
      title: "Pending Payments",
      value: `₹${dashboardData.outstandingAmount || 0}`,
    },
  ];

  return (
    <div>
      {/* Page header */}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Dashboard
        </h2>

        <p className="text-muted mb-0">
          Today's clinic overview
        </p>
      </div>

      {/* Cards */}

      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div
            className="col-12 col-sm-6 col-xl-3"
            key={card.title}
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted small mb-2">
                  {card.title}
                </p>

                <h3 className="fw-bold mb-0">
                  {card.value ?? 0}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Queue */}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">
            Today's Queue
          </h5>
        </div>

        <div className="card-body p-0">
          {!dashboardData.recentAppointments ||
          dashboardData.recentAppointments.length === 0 ? (
            <div className="text-center text-muted py-5">
              No appointments today.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Token</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.recentAppointments.map(
                    (appointment) => (
                      <tr key={appointment._id}>
                        <td className="fw-semibold">
                          #{appointment.tokenNumber}
                        </td>

                        <td>
                          {appointment.patient?.name ||
                            "-"}
                        </td>

                        <td>
                          {appointment.doctor?.name ||
                            "-"}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              appointment.status ===
                              "completed"
                                ? "text-bg-success"
                                : appointment.status ===
                                  "checked-in"
                                ? "text-bg-warning"
                                : appointment.status ===
                                    "cancelled" ||
                                  appointment.status ===
                                    "no-show"
                                ? "text-bg-danger"
                                : "text-bg-primary"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;