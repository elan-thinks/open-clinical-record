import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { RolesPage } from '../pages/admin/RolesPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { PatientsPage } from '../pages/patients/PatientsPage';
import { PatientDetailPage } from '../pages/patients/PatientDetailPage';
import { PatientRegisterPage } from '../pages/patients/PatientRegisterPage';
import { PatientChartPage } from '../pages/clinical/PatientChartPage';
import { ChartIndexPage } from '../pages/clinical/ChartIndexPage';
import { MedicalRecordsPage } from '../pages/clinical/MedicalRecordsPage';
import { RecordVitalsPage } from '../pages/clinical/RecordVitalsPage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { AppointmentCreatePage } from '../pages/appointments/AppointmentCreatePage';
import { CheckInPage } from '../pages/appointments/CheckInPage';
import { ProfilePage } from '../pages/ProfilePage';
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
              <Route path="patients/:id" element={<PatientDetailPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="profile" element={<ProfilePage />} />

              <Route element={<ProtectedRoute roles={['Admin', 'Receptionist', 'Doctor', 'Nurse']} />}>
                <Route path="patients/new" element={<PatientRegisterPage />} />
                <Route path="register" element={<Navigate to="/patients/new" replace />} />
                <Route path="checkin" element={<CheckInPage />} />
                <Route path="appointments/new" element={<AppointmentCreatePage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['Admin', 'Doctor', 'Nurse']} />}>
                <Route path="chart" element={<ChartIndexPage />} />
                <Route path="patients/:patientId/chart" element={<PatientChartPage />} />
                <Route path="records" element={<MedicalRecordsPage />} />
                <Route path="vitals" element={<RecordVitalsPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['Admin']} />}>
                <Route path="admin/users" element={<UsersPage />} />
                <Route path="admin/roles" element={<RolesPage />} />
                <Route path="admin/audit" element={<AuditLogsPage />} />
                <Route
                  path="reports"
                  element={
                    <Placeholder
                      title="Reports"
                      description="Operational and clinical summary reports. (Future milestone)"
                    />
                  }
                />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
