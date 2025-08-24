"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Settings,
  User,
  LogOut,
  Bell,
  PlusCircle,
  XCircle,
  Home,
  BarChart3,
  Activity,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const TradingNavbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState([]);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const uid = localStorage.getItem("uid");
  const navigate = useNavigate();


    const getData = async () => {
      axios
        .get(`https://grow-more-backend-zeta.vercel.app/api/user/get-user/${uid}`)
        .then((res) => {
          setUserData(res.data.user);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    const setOnline = async () => {
      await axios.put(`https://grow-more-backend-zeta.vercel.app/api/user/set-online/${uid}`);
    };

    const setOffline = () => {
      // Axios kaam nahi karega tab close pe → sendBeacon use karo
      navigator.sendBeacon(`https://grow-more-backend-zeta.vercel.app/api/user/set-offline/${uid}`);
    };

    useEffect(() => {
      if (!uid) {
        navigate("/");
      } else {
        getData();
        setOnline();

        window.addEventListener("beforeunload", setOffline);

        return () => {
          setOffline();
          window.removeEventListener("beforeunload", setOffline);
        };
      }
    }, []);


  const handleLogout = () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("uid");
    navigate("/");
  };

  // Close dropdowns when clicking outside [^2]
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className=" top-0 right-0 left-0 md:px-10  lg:left-72 !z-[1111111] bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/30">
      <div className="px-6 ">
        <div className="flex items-center justify-between h-[78px]">
          {/* Left side: App Logo + Welcome Message */}
          <div className="flex items-center gap-3">
            <Link to={"/"}>
              <div className="flex items-center space-x-3">
                <img src="/images/logo.svg" className="w-10" alt="" />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-2xl font-k2d">
                    GrowMore
                  </span>
                  <span className="text-gray-400 text-sm">
                    By Shahbaz Ansari
                  </span>
                </div>
              </div>
            </Link>
          </div>
          {/* { Right side items } */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 p-1.5 cursor-pointer rounded-md text-gray-400"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
                aria-label="User Profile Menu"
              >
                <img
                  src={userData.avatar}
                  alt="User Avatar"
                  className="h-10 w-10 rounded-full border border-gray-600"
                />
                <span className="hidden md:inline font-medium text-lg text-white">
                  {userData.name}
                </span>
                <ChevronDown
                  className={`h-6 w-6 text-gray-400 transform transition-transform duration-300 ${
                    isProfileOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0  mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg origin-top-right animate-fade-in-scale">
                  <ul className="text-sm text-gray-300">
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center cursor-pointer  hover:bg-gray-700 transition-all duration-200 px-4 w-full py-3 "
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TradingNavbar;
