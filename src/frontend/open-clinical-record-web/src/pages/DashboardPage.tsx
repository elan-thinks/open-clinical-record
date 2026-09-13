interface DashboardPageProps {
  role: string;
  userName: string;
}

export function DashboardPage({ role, userName }: DashboardPageProps) {
  return (
    <div className="placeholder-card">
      <h2>Welcome, {userName}</h2>
      <p>
        You are signed in with the <strong style={{ color: 'var(--teal)' }}>{role}</strong> workspace.
        Use the sidebar to open Patients, Chart, Appointments, and other areas for this role.
      </p>
      <p style={{ marginTop: 12, color: 'var(--text-faint)', fontSize: 12.5 }}>
        This layout mirrors the OCR UI mocks. Business modules are not implemented yet.
      </p>
    </div>
  );
}
