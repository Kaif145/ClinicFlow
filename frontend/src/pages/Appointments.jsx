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
  <div className="container-fluid">
    {/* Header */}
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h2 className="fw-bold mb-1">
          Appointments
        </h2>

        <p className="text-muted mb-0">
          Manage clinic appointments and patient queue
        </p>
      </div>

      {(user?.role === "admin" ||
        user?.role === "receptionist") && (
        <Link
          to="/appointments/add"
          className="btn btn-primary"
        >
          + Create Appointment
        </Link>
      )}
    </div>

    {/* Tabs */}
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-2">
        <div
          className="nav nav-pills gap-2"
          role="tablist"
        >
          {[
            ["today", "Today"],
            ["pending", "Pending"],
            ["completed", "Completed"],
            ["closed", "Closed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`nav-link ${
                activeTab === value
                  ? "active"
                  : "text-dark"
              }`}
              onClick={() =>
                setActiveTab(value)
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div className="alert alert-danger">
        {error}
      </div>
    )}

    {/* Appointments */}
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-0 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="fw-semibold mb-0">
            {activeTab === "today"
              ? "Today's Appointments"
              : activeTab === "pending"
              ? "Pending Appointments"
              : activeTab === "completed"
              ? "Completed Appointments"
              : "Closed Appointments"}
          </h5>

          <span className="badge bg-light text-dark">
            {filteredAppointments.length} total
          </span>
        </div>
      </div>

      <div className="card-body p-0">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "64px",
                height: "64px",
              }}
            >
              <span className="fs-3">
                📅
              </span>
            </div>

            <h5 className="fw-semibold">
              No appointments found
            </h5>

            <p className="text-muted mb-0">
              There are no appointments in this section.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end">
                    Action
                  </th>
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

                    const statusClass =
                      appointment.status ===
                      "completed"
                        ? "bg-success-subtle text-success"
                        : appointment.status ===
                          "checked-in"
                        ? "bg-warning-subtle text-warning-emphasis"
                        : appointment.status ===
                            "cancelled" ||
                          appointment.status ===
                            "no-show"
                        ? "bg-danger-subtle text-danger"
                        : "bg-primary-subtle text-primary";

                    return (
                      <tr
                        key={
                          appointment._id
                        }
                      >
                        <td>
                          <span className="badge text-bg-dark">
                            #
                            {
                              appointment.tokenNumber
                            }
                          </span>
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {appointment
                              .patient?.name ||
                              "-"}
                          </div>

                          <small className="text-muted">
                            {appointment
                              .patient?.phone ||
                              ""}
                          </small>
                        </td>

                        <td>
                          {appointment.doctor
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
                            className={`badge rounded-pill ${statusClass}`}
                          >
                            {
                              appointment.status
                            }
                          </span>
                        </td>

                        <td className="text-end">
                          {appointment.status ===
                            "scheduled" &&
                            (user?.role ===
                              "admin" ||
                              user?.role ===
                                "receptionist") && (
                              <select
                                className="form-select form-select-sm d-inline-block"
                                style={{
                                  width:
                                    "150px",
                                }}
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
                                      e.target
                                        .value
                                    );
                                  }
                                }}
                              >
                                <option value="">
                                  Select Action
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
                                className="btn btn-sm btn-primary"
                              >
                                Create Visit
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
                                className="btn btn-sm btn-success"
                              >
                                Create Invoice
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
                                className={`btn btn-sm ${
                                  invoice.paymentStatus ===
                                  "paid"
                                    ? "btn-outline-success"
                                    : "btn-warning"
                                }`}
                              >
                                {invoice.paymentStatus ===
                                "paid"
                                  ? "View Payment"
                                  : "Payment Details"}
                              </Link>
                            )}
                        </td>
                      </tr>
                    );
                  }
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

export default Appointments;