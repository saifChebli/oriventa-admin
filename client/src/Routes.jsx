import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Layout from "./ui/Layout";
import Clients from "./pages/management/Clients";
import Candidates from "./pages/management/Candidates";
import Resume from "./pages/management/Resume";
import Settings from "./pages/settings/Settings";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientMail from "./pages/client/ClientMail";
import ClientSuivi from "./pages/client/ClientSuivi";
import ClientProfile from "./pages/client/ClientProfile";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ui/ProtectedRoutes";
import { ThemeProvider } from "./context/ThemeContext";
import Contact from "./pages/management/Contact";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterRoutes>
          <Route index path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              {/* Everyone with a valid account */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["manager", "admin", "customerService" , 'candidateService' , 'resumeService']}
                  />
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/contacts-management" element={<Contact />} />
              </Route>
              {/* Only admin can see/manage resumes */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["manager", "admin", "customerService"]}
                  />
                }
              >
                <Route path="/clients-management" element={<Clients />} />
              </Route>
              <Route
                element={<ProtectedRoute allowedRoles={["manager", "admin" , 'candidateService']} />}
              >
                <Route path="/candidates-management" element={<Candidates />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["manager", "admin", "resumeService"]}
                  />
                }
              >
                <Route path="/resume-management" element={<Resume />} />
              </Route>
              {/* Mail accessible to all authenticated users */}
              <Route path="/mail" element={<ClientMail />} />
              {/* Client-specific routes */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["client"]}
                  />
                }
              >
                <Route path="/client-dashboard" element={<ClientDashboard />} />
                <Route path="/client-suivi" element={<ClientSuivi />} />
                <Route path="/client-profile" element={<ClientProfile />} />
              </Route>
            </Route>
          </Route>
        </RouterRoutes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
