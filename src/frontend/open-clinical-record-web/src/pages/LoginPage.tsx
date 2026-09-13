import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const DEMO_ACCOUNTS = [
  { email: 'doctor@clinic.local', label: 'Doctor', hint: 'Clinical chart & notes' },
  { email: 'nurse@clinic.local', label: 'Nurse', hint: 'Vitals & observations' },
  { email: 'desk@clinic.local', label: 'Reception', hint: 'Register & appointments' },
  { email: 'admin@clinic.local', label: 'Admin', hint: 'Users & system' },
] as const;

export function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('doctor@clinic.local');
  const [password, setPassword] = useState('Dev@12345');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">OCR</div>
          <div>
            <div className="login-brand-name">Open Clinical Record</div>
            <div className="login-brand-sub">Sign in to your workspace</div>
          </div>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-sub">Role determines your dashboard, navigation, and permissions.</p>

        <form onSubmit={onSubmit}>
          <label className="login-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="login-input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@clinic.local"
            required
          />

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="login-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div className="login-hint">
          <div className="login-hint-title">Demo accounts (password: Dev@12345)</div>
          <div className="login-role-grid">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                className={`login-role-chip${email === a.email ? ' on' : ''}`}
                onClick={() => {
                  setEmail(a.email);
                  setPassword('Dev@12345');
                  setError(null);
                }}
              >
                <b>{a.label}</b>
                <span>{a.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="login-foot">API enforces permissions server-side · JWT after login</p>
      </div>
    </div>
  );
}
