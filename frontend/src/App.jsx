import { Routes, Route } from "react-router-dom";
import "./App.css";
import "./main.css";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Patients from "./pages/Patients.jsx";
import AddPatient from "./pages/AddPatient.jsx";
import PatientDetails from "./pages/PatientDetails.jsx";

import Staff from "./pages/Staff.jsx";

import Appointments from "./pages/Appointments.jsx";
import AddAppointment from "./pages/AddAppointment.jsx";

import AddVisit from "./pages/AddVisit.jsx";

import Invoices from "./pages/Invoices.jsx";
import AddInvoice from "./pages/AddInvoice.jsx";
import InvoiceDetails from "./pages/InvoiceDetails.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Patients */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Layout>
              <Patients />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients/add"
        element={
          <ProtectedRoute>
            <Layout>
              <AddPatient />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientDetails />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Appointments */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Layout>
              <Appointments />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments/add"
        element={
          <ProtectedRoute>
            <Layout>
              <AddAppointment />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Visits */}
      <Route
        path="/visits/add/:appointmentId"
        element={
          <ProtectedRoute>
            <Layout>
              <AddVisit />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Invoices */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/add/:appointmentId"
        element={
          <ProtectedRoute>
            <Layout>
              <AddInvoice />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <InvoiceDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/staff"
  element={
    <ProtectedRoute>
      <Layout>
        <Staff />
      </Layout>
    </ProtectedRoute>
  }
/>
      
    </Routes>
  );
}

export default App;
