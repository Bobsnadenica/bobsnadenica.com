import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
  signUp
} from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { config, isCognitoConfigured } from "./config";
import type { AuthUser, PlanTier, UserRole } from "./types";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  plan: PlanTier;
};

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: AuthUser | null;
  token: string;
  register: (input: RegisterInput) => Promise<{ needsConfirmation: boolean }>;
  confirm: (email: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<string>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_NOT_READY_MESSAGE = "Системата за вход все още не е конфигурирана.";

if (isCognitoConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.cognito.userPoolId,
        userPoolClientId: config.cognito.userPoolClientId
      }
    }
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    async function restoreSession() {
      if (!isCognitoConfigured) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString() || "";
        const claims = session.tokens?.idToken?.payload;

        setUser({
          id: String(claims?.sub || currentUser.userId),
          email: String(claims?.email || ""),
          name: String(claims?.name || currentUser.username)
        });
        setToken(idToken);
      } catch {
        setUser(null);
        setToken("");
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isCognitoConfigured,
      loading,
      user,
      token,
      async register(input) {
        if (!isCognitoConfigured) {
          throw new Error(AUTH_NOT_READY_MESSAGE);
        }

        await signUp({
          username: input.email,
          password: input.password,
          options: {
            userAttributes: {
              email: input.email,
              name: input.name
            }
          }
        });

        return { needsConfirmation: true };
      },
      async confirm(email, code) {
        if (!isCognitoConfigured) {
          throw new Error(AUTH_NOT_READY_MESSAGE);
        }

        await confirmSignUp({
          username: email,
          confirmationCode: code
        });
      },
      async login(email, password) {
        if (!isCognitoConfigured) {
          throw new Error(AUTH_NOT_READY_MESSAGE);
        }

        await signIn({ username: email, password });
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString() || "";
        const claims = session.tokens?.idToken?.payload;
        setUser({
          id: String(claims?.sub || email),
          email: String(claims?.email || email),
          name: String(claims?.name || email)
        });
        setToken(idToken);
        return idToken;
      },
      async requestPasswordReset(email) {
        if (!isCognitoConfigured) {
          throw new Error(AUTH_NOT_READY_MESSAGE);
        }

        await resetPassword({ username: email });
      },
      async completePasswordReset(email, code, newPassword) {
        if (!isCognitoConfigured) {
          throw new Error(AUTH_NOT_READY_MESSAGE);
        }

        await confirmResetPassword({
          username: email,
          confirmationCode: code,
          newPassword
        });
      },
      async logout() {
        if (!isCognitoConfigured) {
          setUser(null);
          setToken("");
          return;
        }

        await signOut();
        setUser(null);
        setToken("");
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
