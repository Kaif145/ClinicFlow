import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AddInvoice() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/invoices",
        {
          appointmentId,

          services: [
            {
              name: serviceName,
              price: Number(price),
              quantity: 1,
            },
          ],

          paidAmount: Number(paidAmount),
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/appointments");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create invoice"
      );
    }
  };

  return (
    <div>
      <h1>Create Invoice</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Service"
          value={serviceName}
          onChange={(e) =>
            setServiceName(e.target.value)
          }
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          required
        />

        <input
          type="number"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={(e) =>
            setPaidAmount(e.target.value)
          }
        />

        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>

        <button type="submit">
          Create Invoice
        </button>
      </form>
    </div>
  );
}

export default AddInvoice;