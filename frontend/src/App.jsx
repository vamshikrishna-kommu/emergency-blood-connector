import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "react-hot-toast";

import RootLayout from "./components/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DonorList from "./pages/DonorList";
import EmergencyRequests from "./pages/EmergencyRequests";
import CreateRequest from "./pages/CreateRequest";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "unauthorized", element: <Unauthorized /> },

        {
          path: "dashboard",
          element: (
            <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "donors",
          element: (
            <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "ADMIN"]}>
              <DonorList />
            </ProtectedRoute>
          ),
        },
        {
          path: "requests",
          element: (
            <ProtectedRoute allowedRoles={["DONOR", "RECEIVER", "ADMIN"]}>
              <EmergencyRequests />
            </ProtectedRoute>
          ),
        },
        {
          path: "create-request",
          element: (
            <ProtectedRoute allowedRoles={["RECEIVER", "ADMIN"]}>
              <CreateRequest />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute allowedRoles={["DONOR"]}>
              <Profile />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#dc2626", secondary: "white" },
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
