import { HashRouter } from "react-router-dom";
import { AuthProvider } from "../lib/auth";
import AppShell from "./layout/AppShell";

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </HashRouter>
  );
}
