import Authentication from "./pages/landing-pages/Authentication";
import "./App.css";
import Home from "./pages/landing-pages/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import TradingSidebar from "./component/trading-dashboard/sidebar/Sidebar";
import TradingNavbar from "./component/trading-dashboard/navbar/Navbar";
import TradingDashboard from "./pages/trading-dashbord/Dashboard";
import TradingDashboardLayout from "./component/trading-dashboard/layout/Layout";
import CoinMarket from "./pages/trading-dashbord/Market";
import TradePage from "./pages/trading-dashbord/Trading";
import SettingsPage from "./pages/trading-dashbord/Settings";
import AdminPage from "./pages/admin-dashboard/Admin";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/auth",
      element: <Authentication />,
    },
    {
      path: "/admin",
      element: <AdminPage />,
    },
    {
      path: "/dashboard",
      element: <TradingDashboardLayout />,
      children: [
        {
          path: "overview",
          element: <TradingDashboard />,
        },
        {
          path: "market",
          element: <CoinMarket />,
        },
        {
          path: "trading",
          element: <TradePage />,
        },
        {
          path: "settings",
          element: <SettingsPage />,
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;