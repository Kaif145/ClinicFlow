import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import api from "../services/api";

function ViewPrescription() {
  const { id } = useParams();

  const prescriptionRef = useRef(null);

  const [prescription, setPrescription] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const loadPrescription = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/prescriptions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPrescription(
        response.data.prescription
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load prescription"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescription();
  }, [id]);

  const printPrescription = () => {
    window.print();
  };

  const downloadPDF = async () => {
    const element =
      prescriptionRef.current;

    if (!element) return;

    const canvas = await html2canvas(
      element,
      {
        scale: 2,
        backgroundColor: "#ffffff",
      }
    );

    const image =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const width =
      pdf.internal.pageSize.getWidth();

    const height =
      (canvas.height * width) /
      canvas.width;

    pdf.addImage(
      image,
      "PNG",
      0,
      0,
      width,
      height
    );

    pdf.save(
      `Prescription-${
        prescription.patient?.name ||
        "patient"
      }.pdf`
    );
  };

  const shareWhatsApp = () => {
    const medicines =
      prescription.medicines
        ?.map(
          (medicine, index) =>
            `${index + 1}. ${medicine.name}
Dosage: ${medicine.dosage || "-"}
Frequency: ${
              medicine.frequency || "-"
            }
Duration: ${
              medicine.duration || "-"
            }
Instructions: ${
              medicine.instructions || "-"
            }`
        )
        .join("\n\n");

    const message = `
PRESCRIPTION

Patient: ${
      prescription.patient?.name
    }

Doctor: Dr. ${
      prescription.doctor?.name
    }

Problem:
${
  prescription.visit?.complaint ||
  "-"
}

Treatment:
${
  prescription.visit?.treatment ||
  "-"
}

Medicines:

${medicines}

Follow-up:
${
  prescription.visit?.followUpDate
    ? new Date(
        prescription.visit.followUpDate
      ).toLocaleDateString()
    : "Not required"
}

Instructions:
${
  prescription.generalInstructions ||
  "-"
}
`;

    const phone =
      prescription.patient?.phone?.replace(
        /\D/g,
        ""
      );

    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(
          message
        )}`
      : `https://wa.me/?text=${encodeURIComponent(
          message
        )}`;

    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  if (!prescription) {
    return null;
  }

  return (
    <div className="container-fluid">

      {/* ACTION BUTTONS */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Prescription
          </h2>

          <p className="text-muted mb-0">
            View and share patient prescription
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-dark"
            onClick={printPrescription}
          >
            Print
          </button>

          <button
            className="btn btn-primary"
            onClick={downloadPDF}
          >
            Download PDF
          </button>

          <button
            className="btn btn-success"
            onClick={shareWhatsApp}
          >
            Share WhatsApp
          </button>
        </div>
      </div>

      {/* PRINT AREA */}

      <div
        ref={prescriptionRef}
        className="prescription-print-area"
      >
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">

            {/* DOCTOR HEADER */}

            <div className="d-flex flex-column flex-md-row justify-content-between border-bottom pb-4 mb-4">
              <div>
                <h2 className="fw-bold text-primary mb-1">
                  ClinicFlow
                </h2>

                <p className="text-muted mb-0">
                  Medical Prescription
                </p>
              </div>

              <div className="text-md-end mt-3 mt-md-0">
                <h5 className="fw-bold mb-1">
                  Dr.{" "}
                  {prescription.doctor?.name}
                </h5>

                <small className="text-muted">
                  {prescription.doctor?.phone}
                </small>
              </div>
            </div>

            {/* PATIENT DETAILS */}

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <small className="text-muted">
                  Patient
                </small>

                <div className="fw-semibold">
                  {prescription.patient?.name}
                </div>
              </div>

              <div className="col-md-4">
                <small className="text-muted">
                  Phone
                </small>

                <div>
                  {prescription.patient?.phone ||
                    "-"}
                </div>
              </div>

              <div className="col-md-4">
                <small className="text-muted">
                  Date
                </small>

                <div>
                  {new Date(
                    prescription.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="col-md-4">
                <small className="text-muted">
                  Gender
                </small>

                <div className="text-capitalize">
                  {prescription.patient
                    ?.gender || "-"}
                </div>
              </div>

              <div className="col-md-4">
                <small className="text-muted">
                  Blood Group
                </small>

                <div>
                  {prescription.patient
                    ?.bloodGroup || "-"}
                </div>
              </div>
            </div>

            <hr />

            {/* PROBLEM */}

            <div className="mb-4">
              <h6 className="fw-bold">
                Chief Complaint / Problem
              </h6>

              <p className="mb-0">
                {prescription.visit
                  ?.complaint || "-"}
              </p>
            </div>

            {/* CLINICAL NOTES */}

            <div className="mb-4">
              <h6 className="fw-bold">
                Clinical Notes
              </h6>

              <p className="mb-0">
                {prescription.visit
                  ?.consultationNotes ||
                  "-"}
              </p>
            </div>

            {/* TREATMENT */}

            <div className="mb-4">
              <h6 className="fw-bold">
                Treatment Plan
              </h6>

              <p className="mb-0">
                {prescription.visit
                  ?.treatment || "-"}
              </p>
            </div>

            {/* MEDICINES */}

            <div className="mb-4">
              <h5 className="fw-bold mb-3">
                Medicines
              </h5>

              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {prescription.medicines?.map(
                      (
                        medicine,
                        index
                      ) => (
                        <tr
                          key={
                            medicine._id ||
                            index
                          }
                        >
                          <td className="fw-semibold">
                            {medicine.name}
                          </td>

                          <td>
                            {medicine.dosage ||
                              "-"}
                          </td>

                          <td>
                            {medicine.frequency ||
                              "-"}
                          </td>

                          <td>
                            {medicine.duration ||
                              "-"}
                          </td>

                          <td>
                            {medicine.instructions ||
                              "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GENERAL INSTRUCTIONS */}

            <div className="mb-4">
              <h6 className="fw-bold">
                General Instructions
              </h6>

              <p className="mb-0">
                {prescription.generalInstructions ||
                  "No additional instructions"}
              </p>
            </div>

            {/* FOLLOW UP */}

            {prescription.visit
              ?.followUpDate && (
              <div className="alert alert-info">
                <strong>
                  Follow-up:
                </strong>{" "}
                {new Date(
                  prescription.visit
                    .followUpDate
                ).toLocaleDateString()}
              </div>
            )}

            {/* SIGNATURE */}

            <div className="text-end mt-5">
              <div className="fw-bold">
                Dr.{" "}
                {prescription.doctor?.name}
              </div>

              <small className="text-muted">
                Doctor Signature
              </small>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPrescription;