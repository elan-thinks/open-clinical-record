import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '../types/auth';
import { fetchMe, loginRequest } from '../services/authApi';
import { clearSession, getStoredUser, getToken, saveSession } from '../services/authStorage';
import { primaryRole } from '../utils/navigation';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  primaryRole: ReturnType<typeof primaryRole> | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const existing = getToken();
      if (!existing) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const me = await fetchMe(existing);
        if (!cancelled) {
          setUser(me);
          setToken(existing);
          saveSession(existing, me);
        }
      } catch {
        clearSession();
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    let nextUser: AuthUser = {
      id: '',
      email: result.email,
      fullName: result.fullName,
      roles: result.roles as AuthUser['roles'],
      mustChangePassword: result.mustChangePassword ?? false,
    };

    try {
      const me = await fetchMe(result.accessToken);
      nextUser = me;
    } catch {
      /* use login payload */
    }

    saveSession(result.accessToken, nextUser);
    setToken(result.accessToken);
    setUser(nextUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const existing = getToken();
    if (!existing) return;
    try {
      const me = await fetchMe(existing);
      setUser(me);
      saveSession(existing, me);
    } catch {
      /* keep current session */
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
      refreshUser,
      primaryRole: user ? primaryRole(user.roles) : null,
    }),
    [user, token, isLoading, login, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
