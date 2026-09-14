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
import { ChartIndexPage } from '../pages/clinical/ChartIndexPage';
import { RecordVitalsPage } from '../pages/clinical/RecordVitalsPage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { AppointmentCreatePage } from '../pages/appointments/AppointmentCreatePage';
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
              <Route path="chart" element={<ChartIndexPage />} />
              <Route path="records" element={<ChartIndexPage />} />
              <Route path="vitals" element={<RecordVitalsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="appointments/new" element={<AppointmentCreatePage />} />
              <Route path="register" element={<PatientRegisterPage />} />
              <Route
                path="checkin"
                element={
                  <Placeholder
                    title="Check-in / Queue"
                    description="Use Appointments to check in patients. Full queue board is planned next."
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
