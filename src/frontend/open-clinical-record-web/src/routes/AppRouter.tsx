import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppShell } from '../layouts/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { UsersPage } from '../pages/admin/UsersPage';
import { RolesPage } from '../pages/admin/RolesPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { PatientsPage } from '../pages/patients/PatientsPage';
import { PatientFormPage } from '../pages/patients/PatientFormPage';
import { PatientChartPage } from '../pages/clinical/PatientChartPage';
import { ChartIndexPage } from '../pages/clinical/ChartIndexPage';
import { MedicalRecordsPage } from '../pages/clinical/MedicalRecordsPage';
import { RecordVitalsPage } from '../pages/clinical/RecordVitalsPage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { AppointmentCreatePage } from '../pages/appointments/AppointmentCreatePage';

function ProtectedApp() {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: '#a7bdae' }}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <AppShell />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedApp />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/new" element={<PatientFormPage />} />
            <Route path="patients/:patientId/edit" element={<PatientFormPage />} />
            <Route path="chart" element={<ChartIndexPage />} />
            <Route path="patients/:patientId/chart" element={<PatientChartPage />} />
            <Route path="records" element={<MedicalRecordsPage />} />
            <Route path="vitals" element={<RecordVitalsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="appointments/new" element={<AppointmentCreatePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="reports" element={<PlaceholderPage title="Reports" />} />
            <Route
              path="admin/users"
              element={<UsersPage />}
            />
            <Route
              path="admin/roles"
              element={<RolesPage />}
            />
            <Route
              path="admin/audit"
              element={<PlaceholderPage title="Audit logs" />}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
