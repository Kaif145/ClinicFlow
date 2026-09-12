import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    return <h2>{error}</h2>;
  }

  if (!dashboardData) {
    return <h2>Loading...</h2>;
  }

 return (
  <div>
    <h1>ClinicFlow Dashboard</h1>

    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3>Total Patients</h3>
        <h2>{dashboardData.totalPatients}</h2>
      </div>

      <div className="dashboard-card">
        <h3>Today's Appointments</h3>
        <h2>{dashboardData.todayAppointments}</h2>
      </div>

      <div className="dashboard-card">
        <h3>Checked-In Patients</h3>
        <h2>{dashboardData.checkedInPatients}</h2>
      </div>

      <div className="dashboard-card">
        <h3>Completed Visits</h3>
        <h2>{dashboardData.completedVisits}</h2>
      </div>

      <div className="dashboard-card">
        <h3>Today's Revenue</h3>
        <h2>₹{dashboardData.todayRevenue}</h2>
      </div>

      <div className="dashboard-card">
        <h3>Pending Payments</h3>
        <h2>₹{dashboardData.pendingPayments}</h2>
      </div>
    </div>
  </div>
);
}

export default Dashboard;