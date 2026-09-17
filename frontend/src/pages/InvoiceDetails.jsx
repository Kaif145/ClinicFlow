import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../services/api";

function InvoiceDetails() {
  const { id } = useParams();
  
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const invoiceRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch invoice
  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const selectedInvoice = response.data.invoices?.find(
        (item) => item._id === id
      );

      if (!selectedInvoice) {
        setInvoice(null);
        setError("Invoice not found");
        return;
      }

      setInvoice(selectedInvoice);
    } catch (err) {
      console.log("LOAD INVOICE ERROR:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "Failed to load invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  // Add payment
  const addPayment = async (e) => {
    e.preventDefault();

    try {
      setPaymentLoading(true);
      setError("");
      setSuccess("");

      const paymentAmount = Number(amount);

      if (!paymentAmount || paymentAmount <= 0) {
        setError("Enter a valid payment amount");
        return;
      }

      const pendingAmount =
        invoice.totalAmount - invoice.paidAmount;

      if (paymentAmount > pendingAmount) {
        setError(
          `Payment cannot exceed pending amount ₹${pendingAmount}`
        );
        return;
      }

      await api.patch(
        `/invoices/${id}/payment`,
        {
          amount: paymentAmount,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAmount("");
      setSuccess("Payment added successfully");

      await loadInvoice();
    } catch (err) {
      console.log("PAYMENT ERROR:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "Failed to add payment"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        />
      </div>
    );
  }

  // Invoice not found / loading failed
  if (!invoice) {
    return (
      <div className="alert alert-danger">
        {error || "Invoice not found"}
      </div>
    );
  }

  const pendingAmount =
    invoice.totalAmount - invoice.paidAmount;
const printInvoice = () => {
  window.print();
};
const downloadPDF = async () => {
  const element = invoiceRef.current;

  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  const imageData = canvas.toDataURL("image/png");

  const pdf = new jsPDF(
    "p",
    "mm",
    "a4"
  );

  const pdfWidth =
    pdf.internal.pageSize.getWidth();

  const imageHeight =
    (canvas.height * pdfWidth) /
    canvas.width;

  pdf.addImage(
    imageData,
    "PNG",
    0,
    0,
    pdfWidth,
    imageHeight
  );

  pdf.save(
    `${
      invoice.invoiceNumber ||
      "ClinicFlow-Invoice"
    }.pdf`
  );
};

const shareWhatsApp = () => {
  const pendingAmount =
    invoice.totalAmount -
    invoice.paidAmount;

  const message = `
ClinicFlow Invoice

Invoice: ${
    invoice.invoiceNumber || invoice._id
  }

Patient: ${
    invoice.patient?.name || "-"
  }

Total: ₹${invoice.totalAmount}
Paid: ₹${invoice.paidAmount}
Pending: ₹${pendingAmount}

Thank you.
`;

  const url =
    `https://wa.me/?text=${encodeURIComponent(
      message
    )}`;

  window.open(url, "_blank");
};

 return (
  <div className="container-fluid">
    {/* Header */}
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 className="fw-bold mb-1">
          Invoice Details
        </h2>

        <p className="text-muted mb-0">
          Invoice #
          {invoice.invoiceNumber || invoice._id}
        </p>
      </div>

      <span
        className={`badge rounded-pill px-3 py-2 ${
          invoice.paymentStatus === "paid"
            ? "bg-success"
            : invoice.paymentStatus === "partial"
            ? "bg-warning text-dark"
            : "bg-danger"
        }`}
      >
        {invoice.paymentStatus}
      </span>
    </div>

    {/* Messages */}
    {error && (
      <div className="alert alert-danger">
        {error}
      </div>
    )}

    {success && (
      <div className="alert alert-success">
        {success}
      </div>
    )}

    {/* Actions */}
    <div className="d-flex flex-wrap gap-2 mb-4">
      <button
        type="button"
        className="btn btn-outline-dark"
        onClick={printInvoice}
      >
        Print Invoice
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={downloadPDF}
      >
        Download PDF
      </button>

      <button
        type="button"
        className="btn btn-success"
        onClick={shareWhatsApp}
      >
        Share WhatsApp
      </button>
    </div>

    {/* Everything inside this will be printed/downloaded */}
    <div
      ref={invoiceRef}
      className="invoice-print-area"
    >
      {/* Invoice heading */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
            <div>
              <h3 className="fw-bold text-primary mb-1">
                ClinicFlow
              </h3>

              <p className="text-muted mb-0">
                Clinic Invoice
              </p>
            </div>

            <div className="text-md-end">
              <div className="fw-semibold">
                Invoice #
              </div>

              <div className="text-muted">
                {invoice.invoiceNumber || invoice._id}
              </div>

              <div className="text-muted small mt-1">
                {invoice.createdAt
                  ? new Date(
                      invoice.createdAt
                    ).toLocaleDateString()
                  : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient + payment summary */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">
            Invoice Summary
          </h5>

          <div className="row g-4">
            <div className="col-md-3">
              <small className="text-muted">
                Patient
              </small>

              <div className="fw-semibold fs-5">
                {invoice.patient?.name || "-"}
              </div>

              <small className="text-muted">
                {invoice.patient?.phone || ""}
              </small>
            </div>

            <div className="col-md-3">
              <small className="text-muted">
                Total Amount
              </small>

              <div className="fw-bold fs-4">
                ₹{invoice.totalAmount}
              </div>
            </div>

            <div className="col-md-3">
              <small className="text-muted">
                Paid Amount
              </small>

              <div className="fw-bold fs-4 text-success">
                ₹{invoice.paidAmount}
              </div>
            </div>

            <div className="col-md-3">
              <small className="text-muted">
                Pending
              </small>

              <div
                className={`fw-bold fs-4 ${
                  pendingAmount > 0
                    ? "text-warning"
                    : "text-success"
                }`}
              >
                ₹{pendingAmount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">
            Services
          </h5>
        </div>

        <div className="card-body p-0">
          {invoice.services?.length > 0 ? (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Service</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th className="text-end">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoice.services.map(
                    (service, index) => (
                      <tr
                        key={
                          service._id ||
                          index
                        }
                      >
                        <td className="fw-semibold">
                          {service.name}
                        </td>

                        <td>
                          {service.quantity ||
                            1}
                        </td>

                        <td>
                          ₹{service.price}
                        </td>

                        <td className="text-end fw-semibold">
                          ₹
                          {service.price *
                            (service.quantity ||
                              1)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-muted">
              No services found.
            </div>
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">
            Payment History
          </h5>
        </div>

        <div className="card-body">
          {invoice.payments?.length >
          0 ? (
            <div className="list-group list-group-flush">
              {invoice.payments.map(
                (payment, index) => (
                  <div
                    key={
                      payment._id ||
                      index
                    }
                    className="list-group-item px-0 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2"
                  >
                    <div>
                      <div className="fw-bold">
                        ₹
                        {payment.amount}
                      </div>

                      <small className="text-muted text-uppercase">
                        {payment.method}
                      </small>
                    </div>

                    <small className="text-muted">
                      {payment.paidAt
                        ? new Date(
                            payment.paidAt
                          ).toLocaleString()
                        : "-"}
                    </small>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-muted mb-0">
              No payments recorded.
            </p>
          )}
        </div>
      </div>

      {/* Final total */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row justify-content-end">
            <div className="col-md-5">
              <div className="d-flex justify-content-between mb-2">
                <span>Total</span>

                <strong>
                  ₹{invoice.totalAmount}
                </strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Paid</span>

                <strong className="text-success">
                  ₹{invoice.paidAmount}
                </strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <span className="fw-bold">
                  Balance Due
                </span>

                <strong
                  className={
                    pendingAmount > 0
                      ? "text-danger"
                      : "text-success"
                  }
                >
                  ₹{pendingAmount}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Do NOT include this form in print/PDF */}
    {invoice.paymentStatus !== "paid" ? (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-1">
            Add Payment
          </h5>

          <p className="text-muted">
            Remaining amount: ₹
            {pendingAmount}
          </p>

          <form onSubmit={addPayment}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Payment Amount
                </label>

                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  min="1"
                  max={pendingAmount}
                  placeholder={`Maximum ₹${pendingAmount}`}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Payment Method
                </label>

                <select
                  className="form-select"
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
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={paymentLoading}
            >
              {paymentLoading
                ? "Processing..."
                : "Add Payment"}
            </button>
          </form>
        </div>
      </div>
    ) : (
      <div className="alert alert-success">
        ✓ This invoice is fully paid.
      </div>
    )}
  </div>
);
}

export default InvoiceDetails;