import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function InvoiceDetails() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const token = localStorage.getItem("token");

  const loadInvoices = async () => {
    try {
      const response = await api.get("/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const selectedInvoice =
        response.data.invoices.find(
          (item) => item._id === id
        );

      setInvoice(selectedInvoice);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [id]);

  const addPayment = async (e) => {
    e.preventDefault();

    try {
      await api.patch(
        `/invoices/${id}/payment`,
        {
          amount: Number(amount),
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAmount("");

      await loadInvoices();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Payment failed"
      );
    }
  };

  if (!invoice) {
    return <h2>Loading invoice...</h2>;
  }

  const pendingAmount =
    invoice.totalAmount - invoice.paidAmount;

  return (
    <div>
      <h1>Payment Details</h1>

      <h3>
        Patient: {invoice.patient?.name}
      </h3>

      <p>Total: ₹{invoice.totalAmount}</p>

      <p>Paid: ₹{invoice.paidAmount}</p>

      <p>Pending: ₹{pendingAmount}</p>

      <p>
        Status: {invoice.paymentStatus}
      </p>

      <hr />

      <h2>Payment History</h2>

      {invoice.payments?.length > 0 ? (
        invoice.payments.map((payment) => (
          <div key={payment._id}>
            <p>
              ₹{payment.amount} -{" "}
              {payment.method}
            </p>

            <p>
              {new Date(
                payment.paidAt
              ).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p>No payments recorded.</p>
      )}

      {invoice.paymentStatus !== "paid" && (
        <>
          <hr />

          <h2>Add Payment</h2>

          <form onSubmit={addPayment}>
            <input
              type="number"
              placeholder={`Pending ₹${pendingAmount}`}
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              max={pendingAmount}
              required
            />

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
            >
              <option value="cash">
                Cash
              </option>

              <option value="upi">
                UPI
              </option>

              <option value="card">
                Card
              </option>

              <option value="other">
                Other
              </option>
            </select>

            <button type="submit">
              Add Payment
            </button>
          </form>
        </>
      )}

      {invoice.paymentStatus === "paid" && (
        <h2>✅ Payment Completed</h2>
      )}
    </div>
  );
}

export default InvoiceDetails;