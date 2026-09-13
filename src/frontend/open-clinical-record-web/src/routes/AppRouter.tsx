import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { RolesPage } from '../pages/admin/RolesPage';
import { PatientsPage } from '../pages/patients/PatientsPage';
import { PatientDetailPage } from '../pages/patients/PatientDetailPage';
import { PatientRegisterPage } from '../pages/patients/PatientRegisterPage';
import { PatientChartPage } from '../pages/clinical/PatientChartPage';
import { ProtectedRoute } from './ProtectedRoute';

function Placeholder({ title, description }: { title: string; description: string }) {
  return <PlaceholderPage title={title} description={description} />;
}

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="patients/new" element={<PatientRegisterPage />} />
              <Route path="patients/:id" element={<PatientDetailPage />} />
              <Route path="patients/:patientId/chart" element={<PatientChartPage />} />
              <Route
                path="chart"
                element={
                  <Placeholder
                    title="Medical Chart"
                    description="Open a patient from Patients, then use Open chart."
                  />
                }
              />
              <Route
                path="records"
                element={
                  <Placeholder
                    title="Medical Records"
                    description="Open a patient chart for visits, vitals, and notes."
                  />
                }
              />
              <Route
                path="appointments"
                element={
                  <Placeholder
                    title="Appointments"
                    description="Schedule, reschedule, cancel, and view appointment status."
                  />
                }
              />
              <Route
                path="vitals"
                element={
                  <Placeholder
                    title="Record vitals"
                    description="Open a patient chart and use New consultation to capture vitals."
                  />
                }
              />
              <Route path="register" element={<PatientRegisterPage />} />
              <Route
                path="checkin"
                element={
                  <Placeholder
                    title="Check-in / Queue"
                    description="Check in arrivals and manage the walk-in queue."
                  />
                }
              />
              <Route
                path="reports"
                element={
                  <Placeholder title="Reports" description="Operational and clinical summary reports." />
                }
              />
              <Route
                path="profile"
                element={
                  <Placeholder title="Profile" description="Your account details and preferences." />
                }
              />
              <Route path="admin/users" element={<UsersPage />} />
              <Route path="admin/roles" element={<RolesPage />} />
              <Route
                path="admin/audit"
                element={
                  <Placeholder
                    title="Audit Logs"
                    description="Review security and clinical audit events."
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
