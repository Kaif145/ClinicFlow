import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvoices(response.data.invoices || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load invoices"
      );
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div>
      <h1>Invoices</h1>

      {error && <p>{error}</p>}

      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => {
              const pending =
                invoice.totalAmount - invoice.paidAmount;

              return (
                <tr key={invoice._id}>
                  <td>
                    {invoice.patient?.name || "-"}
                  </td>

                  <td>₹{invoice.totalAmount}</td>

                  <td>₹{invoice.paidAmount}</td>

                  <td>₹{pending}</td>

                  <td>{invoice.paymentStatus}</td>

                  <td>
                    <Link to={`/invoices/${invoice._id}`}>
                      <button>
                        {invoice.paymentStatus === "paid"
                          ? "View"
                          : "Pay / Details"}
                      </button>
                    </Link>
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

export default Invoices;