import { useState } from "react";
import {
  Home,
  BarChart3,
  TrendingUp,
  Settings,
  LogOut,
  PieChart,
  Wallet,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const TradingSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard/overview",
      icon: Home,
      current: true,
    },
    {
      name: "Market",
      href: "/dashboard/market",
      icon: BarChart3,
      current: false,
    },
    {
      name: "Trading",
      href: "/dashboard/trading",
      icon: Activity,
      current: false,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: false,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed cursor-pointer top-4 left-4 z-50 p-3 rounded-xl bg-gray-800/90 backdrop-blur-sm text-yellow-400 hover:bg-gray-700/90 transition-all duration-200 shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={` inset-y-0 left-0 z-50 min-w-[270px] bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/30 transform transition-transform duration-300 ease-in-out fixed lg:relative ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center !z-[-11] h-20 px-6 border-b border-gray-700/30">
          <Link to={"/"}>
            <div className="flex items-center space-x-3">
              <img src="/images/logo.svg" className="w-10" alt="" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl font-k2d">
                  GrowMore
                </span>
                <span className="text-gray-400 text-sm">By Shahbaz Ansari</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-6">
          <div className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const location = useLocation();
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center px-4 py-4 text-sm font-medium rounded-2xl
        focus:outline-none focus:ring-0 border-[#1d2433]  bg-[#1d2433] 
        ${
          isActive
            ? "bg-gradient-to-r from-yellow-500/15 to-orange-500/15 text-yellow-400 shadow-lg border border-yellow-500/20 backdrop-blur-sm"
            : "text-gray-300 hover:text-white hover:bg-gray-700/30 "
        }`}
                  style={{ cursor: "pointer" }}
                >
                  <Icon
                    className={`mr-4 h-5 w-5 transition-colors duration-200 ${
                      isActive
                        ? "text-yellow-400"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/30">
          <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-all duration-200 group">
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
};

export default TradingSidebar;
