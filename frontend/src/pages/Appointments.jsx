import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Appointments() {
  const [appointments, setAppointments] =
    useState([]);

  const [invoices, setInvoices] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("today");

  const [error, setError] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token =
    localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      setError("");

      let response;

      if (user?.role === "doctor") {
        response = await api.get(
          "/appointments/my",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setAppointments(
          response.data.appointments || []
        );

        return;
      }

      response = await api.get(
        "/appointments",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setAppointments(
        response.data.allAppointment || []
      );

      const invoiceResponse =
        await api.get("/invoices", {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        });

      setInvoices(
        invoiceResponse.data.invoices || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load appointments"
      );
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const changeStatus = async (
    id,
    status
  ) => {
    try {
      await api.patch(
        `/appointments/${id}/status`,
        { status },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      await fetchAppointments();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  const today =
    new Date().toDateString();

  const filteredAppointments =
    appointments.filter(
      (appointment) => {
        const appointmentDay =
          new Date(
            appointment.date
          ).toDateString();

        if (activeTab === "today") {
          return appointmentDay === today;
        }

        if (activeTab === "pending") {
          return (
            appointment.status ===
              "scheduled" ||
            appointment.status ===
              "checked-in"
          );
        }

        if (
          activeTab === "completed"
        ) {
          return (
            appointment.status ===
            "completed"
          );
        }

        if (activeTab === "closed") {
          return (
            appointment.status ===
              "cancelled" ||
            appointment.status ===
              "no-show"
          );
        }

        return true;
      }
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>
            Manage clinic appointments
            and patient queue
          </p>
        </div>

        {(user?.role === "admin" ||
          user?.role ===
            "receptionist") && (
          <Link to="/appointments/add">
            <button>
              + Create Appointment
            </button>
          </Link>
        )}
      </div>

      <div className="appointment-tabs">
        <button
          className={
            activeTab === "today"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("today")
          }
        >
          Today
        </button>

        <button
          className={
            activeTab === "pending"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("pending")
          }
        >
          Pending
        </button>

        <button
          className={
            activeTab ===
            "completed"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("completed")
          }
        >
          Completed
        </button>

        <button
          className={
            activeTab === "closed"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("closed")
          }
        >
          Closed
        </button>
      </div>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {filteredAppointments.length ===
      0 ? (
        <div className="empty-state">
          No appointments found.
        </div>
      ) : (
        <table>
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
            {filteredAppointments.map(
              (appointment) => {
                const invoice =
                  invoices.find(
                    (invoice) =>
                      invoice
                        .appointment
                        ?._id ===
                        appointment._id ||
                      invoice.appointment ===
                        appointment._id
                  );

                return (
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
                      {appointment
                        .patient
                        ?.name || "-"}
                    </td>

                    <td>
                      {appointment
                        .doctor
                        ?.name || "-"}
                    </td>

                    <td>
                      {new Date(
                        appointment.date
                      ).toLocaleString()}
                    </td>

                    <td>
                      {appointment.reason ||
                        "-"}
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

                    <td>
                      {appointment.status ===
                        "scheduled" &&
                        (user?.role ===
                          "admin" ||
                          user?.role ===
                            "receptionist") && (
                          <select
                            defaultValue=""
                            onChange={(
                              e
                            ) => {
                              if (
                                e.target
                                  .value
                              ) {
                                changeStatus(
                                  appointment._id,
                                  e
                                    .target
                                    .value
                                );
                              }
                            }}
                          >
                            <option value="">
                              Action
                            </option>

                            <option value="checked-in">
                              Check In
                            </option>

                            <option value="cancelled">
                              Cancel
                            </option>

                            <option value="no-show">
                              No Show
                            </option>
                          </select>
                        )}

                      {appointment.status ===
                        "checked-in" &&
                        user?.role ===
                          "doctor" && (
                          <Link
                            to={`/visits/add/${appointment._id}`}
                          >
                            <button>
                              Create Visit
                            </button>
                          </Link>
                        )}

                      {appointment.status ===
                        "completed" &&
                        !invoice &&
                        (user?.role ===
                          "admin" ||
                          user?.role ===
                            "receptionist") && (
                          <Link
                            to={`/invoices/add/${appointment._id}`}
                          >
                            <button>
                              Create Invoice
                            </button>
                          </Link>
                        )}

                      {appointment.status ===
                        "completed" &&
                        invoice &&
                        (user?.role ===
                          "admin" ||
                          user?.role ===
                            "receptionist") && (
                          <Link
                            to={`/invoices/${invoice._id}`}
                          >
                            <button>
                              {invoice.paymentStatus ===
                              "paid"
                                ? "View Payment"
                                : "Payment Details"}
                            </button>
                          </Link>
                        )}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Appointments;