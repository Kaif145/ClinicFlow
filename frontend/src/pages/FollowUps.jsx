import { useEffect, useState } from "react";
import api from "../services/api";

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    const loadFollowUps = async () => {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/visits/follow-ups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFollowUps(
        response.data.followUps || []
      );
    };

    loadFollowUps();
  }, []);

  const sendWhatsApp = (visit) => {
    const patient = visit.patient;

    const message = `
Hello ${patient?.name},

This is a reminder from ClinicFlow.

Your follow-up appointment with Dr. ${
      visit.doctor?.name
    } is scheduled for ${new Date(
      visit.followUpDate
    ).toLocaleDateString()}.

Thank you.
`;

    const phone =
      patient?.phone?.replace(/\D/g, "");

    window.open(
      `https://wa.me/91${phone}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="fw-bold">
          Follow-up Reminders
        </h2>

        <p className="text-muted">
          Upcoming patient follow-ups
        </p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Follow-up Date</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {followUps.map((visit) => (
                  <tr key={visit._id}>
                    <td>
                      {visit.patient?.name}
                    </td>

                    <td>
                      {visit.doctor?.name}
                    </td>

                    <td>
                      {new Date(
                        visit.followUpDate
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {visit.patient?.phone}
                    </td>

                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          sendWhatsApp(visit)
                        }
                      >
                        Send WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}

                {followUps.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-5 text-muted"
                    >
                      No upcoming follow-ups.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FollowUps;