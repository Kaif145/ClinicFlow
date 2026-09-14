import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [dashboardData, setDashboardData] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDashboard =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          const response =
            await api.get(
              "/dashboard",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          setDashboardData(
            response.data
          );
        } catch (error) {
          setError(
            error.response?.data
              ?.message ||
              "Failed to load dashboard"
          );
        }
      };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <p className="error">
        {error}
      </p>
    );
  }

  if (!dashboardData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Today's clinic overview
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Patients</h3>

          <h2>
            {
              dashboardData.totalPatients
            }
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>
            Today's Appointments
          </h3>

          <h2>
            {
              dashboardData.todayAppointments
            }
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>Checked In</h3>

          <h2>
            {
              dashboardData.checkedInPatients
            }
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>
            Completed Today
          </h3>

          <h2>
            {
              dashboardData.completedToday
            }
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>
            Pending Appointments
          </h3>

          <h2>
            {
              dashboardData.pendingAppointments
            }
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>Today's Revenue</h3>

          <h2>
            ₹
            {
              dashboardData.todayRevenue
            }
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>
            Monthly Revenue
          </h3>

          <h2>
            ₹
            {
              dashboardData.monthlyRevenue
            }
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>
            Pending Payments
          </h3>

          <h2>
            ₹
            {
              dashboardData.outstandingAmount
            }
          </h2>
        </div>
      </div>

      <h2 className="section-title">
        Today's Queue
      </h2>

      {dashboardData
        .recentAppointments.length ===
      0 ? (
        <div className="empty-state">
          No appointments today.
        </div>
      ) : (
        <table>
          <thead>
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
                <tr
                  key={
                    appointment._id
                  }
                >
                  <td>
                    #
                    {
                      appointment.tokenNumber
                    }
                  </td>

                  <td>
                    {
                      appointment.patient
                        ?.name
                    }
                  </td>

                  <td>
                    {
                      appointment.doctor
                        ?.name
                    }
                  </td>

                  <td>
                    <span
                      className={`status status-${appointment.status}`}
                    >
                      {
                        appointment.status
                      }
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;