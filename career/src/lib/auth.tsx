import {
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
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

const MOCK_KEY = "careerdoc.mock.credentials";

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
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

type MockCredential = {
  email: string;
  password: string;
  name: string;
  confirmed: boolean;
};

function readCredentials() {
  if (typeof window === "undefined") {
    return [] as MockCredential[];
  }

  const raw = window.localStorage.getItem(MOCK_KEY);

  if (!raw) {
    return [] as MockCredential[];
  }

  try {
    return JSON.parse(raw) as MockCredential[];
  } catch {
    return [] as MockCredential[];
  }
}

function writeCredentials(credentials: MockCredential[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MOCK_KEY, JSON.stringify(credentials));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    async function restoreSession() {
      if (!isCognitoConfigured) {
        const currentEmail = window.localStorage.getItem("careerdoc.mock.session");

        if (currentEmail) {
          const credentials = readCredentials();
          const match = credentials.find((item) => item.email === currentEmail);

          if (match) {
            setUser({ id: match.email, email: match.email, name: match.name });
            setToken(match.email);
          }
        }

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
          const credentials = readCredentials();
          const exists = credentials.some((item) => item.email === input.email);

          if (exists) {
            throw new Error("Профил с този имейл вече съществува.");
          }

          writeCredentials([
            ...credentials,
            {
              email: input.email,
              password: input.password,
              name: input.name,
              confirmed: false
            }
          ]);

          return { needsConfirmation: true };
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
          if (code !== "123456") {
            throw new Error("В mock режима кодът за потвърждение е 123456.");
          }

          const credentials = readCredentials().map((item) =>
            item.email === email ? { ...item, confirmed: true } : item
          );
          writeCredentials(credentials);
          return;
        }

        await confirmSignUp({
          username: email,
          confirmationCode: code
        });
      },
      async login(email, password) {
        if (!isCognitoConfigured) {
          const credentials = readCredentials();
          const match = credentials.find(
            (item) => item.email === email && item.password === password
          );

          if (!match) {
            throw new Error("Невалиден имейл или парола.");
          }

          if (!match.confirmed) {
            throw new Error("Потвърдете регистрацията си с код 123456.");
          }

          window.localStorage.setItem("careerdoc.mock.session", match.email);
          setUser({ id: match.email, email: match.email, name: match.name });
          setToken(match.email);
          return match.email;
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
      async logout() {
        if (!isCognitoConfigured) {
          window.localStorage.removeItem("careerdoc.mock.session");
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
