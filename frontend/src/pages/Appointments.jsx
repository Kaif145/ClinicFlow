import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      setError("");

      // Doctor → only their own appointments
      if (user?.role === "doctor") {
        const response = await api.get("/appointments/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAppointments(response.data.appointments || []);
        setInvoices([]);

        return;
      }

      // Admin + Receptionist
      const [appointmentResponse, invoiceResponse] = await Promise.all([
        api.get("/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        api.get("/invoices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setAppointments(appointmentResponse.data.allAppointment || []);

      setInvoices(invoiceResponse.data.invoices || []);
    } catch (error) {
      console.log(error.response?.data);

      setError(error.response?.data?.message || "Failed to load appointments");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await api.patch(
        `/appointments/${id}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchAppointments();
    } catch (error) {
      console.log(error.response?.data);

      alert(
        error.response?.data?.message || "Failed to update appointment status",
      );
    }
  };

  return (
    <div>
      <h1>Appointments</h1>

      {/* Only Admin and Receptionist can create appointments */}
      {(user?.role === "admin" || user?.role === "receptionist") && (
        <Link to="/appointments/add">
          <button>Create Appointment</button>
        </Link>
      )}

      {error && <p>{error}</p>}

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Token</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => {
              const invoice = invoices.find(
                (invoice) =>
                  invoice.appointment?._id === appointment._id ||
                  invoice.appointment === appointment._id,
              );

              return (
                <tr key={appointment._id}>
                  <td>{appointment.tokenNumber}</td>

                  <td>{appointment.patient?.name || "-"}</td>

                  <td>{appointment.doctor?.name || "-"}</td>

                  <td>{new Date(appointment.date).toLocaleString()}</td>

                  <td>{appointment.reason || "-"}</td>

                  <td>
                    <span className={`status status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>

                  <td>
                    {/* Admin / Receptionist */}
                    {appointment.status === "scheduled" &&
                      (user?.role === "admin" ||
                        user?.role === "receptionist") && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              changeStatus(appointment._id, e.target.value);
                            }
                          }}
                        >
                          <option value="">Select Action</option>

                          <option value="checked-in">Check In</option>

                          <option value="cancelled">Cancel Appointment</option>

                          <option value="no-show">No Show</option>
                        </select>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Appointments;
