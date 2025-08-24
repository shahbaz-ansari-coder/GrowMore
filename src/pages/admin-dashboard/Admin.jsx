"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Eye,
  Edit,
  Shield,
  ShieldOff,
  Trash,
  MessageSquare,
  AlertCircle,
  Clock,
  Coins,
  Search,
  Filter,
  RotateCcw,
  User,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Send,
  Calendar,
  DollarSign,
  Activity,
  Users,
  Mail,
  Settings,
  Wallet,
  Bitcoin,
  EclipseIcon as Ethereum,
  Wifi,
  EyeOff,
  Ban
} from "lucide-react";
import TradingNavbar from "../../component/trading-dashboard/navbar/Navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../component/admin-dashboard/Navbar";
const uid = localStorage.getItem("uid");

// Helper function for formatting currency
const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return "N/A";
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Helper for formatting amount (e.g., crypto amount)
const formatAmount = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "N/A";
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
};

// Generate avatar based on user name
const generateAvatar = (name) => {
  const colors = [
    "bg-[#f6b93b]",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-orange-600",
    "bg-amber-600",
    "bg-yellow-600",
    "bg-orange-400",
  ];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colorIndex = name.length % colors.length;
  return { initials, color: colors[colorIndex] };
};

// Dashboard Cards Component
const DashboardCards = ({ users }) => {
  // agar users null/undefined ho to empty array bana do
  const safeUsers = users || [];

  // ✅ Total Users
  const totalUsers = safeUsers.length;

  // ✅ Active Users
  const activeUsers = safeUsers.filter((u) => u.is_blocked === false).length;

  // ✅ Block Users
  const blockUsers = safeUsers.filter((u) => u.is_blocked === true).length;

  // ✅ Online Users (agar tumhare paas online status ka field ho, maan lo u.is_online)
  const onlineUsers = safeUsers.filter((u) => u.is_online === true).length;

  const cards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "from-[#f6b93b] to-orange-500",
      bgColor: "bg-[#f6b93b]/10",
      borderColor: "border-[#f6b93b]/30",
    },
    {
      title: "Online Now",
      value: onlineUsers,
      icon: Wifi,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      title: "Total Balance",
      value: blockUsers,
      icon: Ban,
      color: "from-red-500 to-[#7c2009]",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} ${card.borderColor} border rounded-2xl p-6 backdrop-blur-sm  transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{card.title}</p>
              <p className="text-white text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div
              className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center`}
            >
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// User Holdings Modal
const UserHoldingsModal = ({ onClose, user }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-600/50 transform animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f6b93b]/10 to-orange-500/10"></div>

        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 z-10 cursor-pointer"
          onClick={onClose}
          aria-label="Close holdings modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 rounded-full overflow-hidden  flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg`}
            >
              <img
                src={user.avatar || "/images/user.png"}
                className="object-cover h-full w-full"
                alt="avatar"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{user.name}</h3>
            <div className="flex items-center justify-center gap-2">
              <Wallet className="h-5 w-5 text-[#f6b93b]" />
              <span className="text-gray-400">Portfolio Overview</span>
            </div>
          </div>

          {user?.trades && user?.trades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.trades
                .filter((trade) => trade.status === "OPEN") // ✅ sirf active trades
                .map((trade, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 hover:border-[#f6b93b]/50 transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={trade.coinImage}
                        alt={trade.coinName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="text-white font-bold text-lg">
                          {trade.coinName}
                        </h4>
                        <p className="text-gray-400 text-sm uppercase">
                          {trade.coinShortName}
                        </p>
                      </div>
                    </div>

                    {/* Trade Info */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-semibold">
                          {formatAmount(trade.buyAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Buy Price:</span>
                        <span className="text-white font-semibold">
                          {formatPrice(trade.buyPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Value:</span>
                        <span className="text-[#f6b93b] font-bold">
                          {formatPrice(trade.buyAmount * trade.buyPrice)}
                        </span>
                      </div>

                      {/* ✅ Date & Time */}
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-600/30">
                        <span className="text-gray-400">Bought On:</span>
                        <span className="text-gray-300">
                          {trade.buyDate} {trade.buyTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No Active Trades
              </h3>
              <p className="text-gray-400">
                This user doesn't have any active cryptocurrency trades yet.
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-8 text-center">
            <button
              className="bg-gradient-to-r from-[#f6b93b] to-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:from-[#f6b93b]/80 hover:to-orange-500/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Messages Modal
const UserMessagesModal = ({ onClose, user }) => {
  if (!user) return null;

  const avatar = generateAvatar(user.name);

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-600/50 transform animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f6b93b]/10 to-orange-500/10"></div>

        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 z-10 cursor-pointer"
          onClick={onClose}
          aria-label="Close messages modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 overflow-hidden rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg`}
            >
              <img
                src={user.avatar || "/images/user.png"}
                className="object-cover h-full w-full"
                alt="avatar"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{user.name}</h3>
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#f6b93b]" />
              <span className="text-gray-400">Messages History</span>
            </div>
          </div>

          {/* Messages List */}
          {user.messages && user.messages.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
              {user.messages.map((message, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 hover:border-[#f6b93b]/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#f6b93b]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-[#f6b93b]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                          Admin Message
                        </span>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(message.sentAt)}</span>
                          <span>{formatTime(message.sentAt)}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {message.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No Messages Found
              </h3>
              <p className="text-gray-400">
                No messages have been sent to this user yet.
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-8 text-center">
            <button
              className="bg-gradient-to-r from-[#f6b93b] to-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:from-[#f6b93b]/80 hover:to-orange-500/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddUserModal = ({ onClose, onAddUser, getData }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    axios
      .post(`http://localhost:3000/api/admin/add-user/${uid}`, {
        name: name,
        email: email,
        password: password,
      })
      .then((res) => {
        getData();
        onClose();
        toast.success("User added successfully ");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message || "Something is wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-600/50 transform animate-slideUp">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f6b93b]/10 to-orange-500/10"></div>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 z-10 cursor-pointer"
          onClick={onClose}
          aria-label="Close add user modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Add New User</h3>
            <p className="text-gray-400 text-sm">Create a new user account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="user-name"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  className="w-full bg-gray-700/50 text-white rounded-xl border border-gray-600/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f6b93b]/50 focus:border-[#f6b93b]/50 transition-all backdrop-blur-sm cursor-text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-email"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  id="user-email"
                  type="email"
                  className="w-full bg-gray-700/50 text-white rounded-xl border border-gray-600/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f6b93b]/50 focus:border-[#f6b93b]/50 transition-all backdrop-blur-sm cursor-text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-password"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  <Shield className="inline h-4 w-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-gray-700/50 text-white rounded-xl border border-gray-600/50 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#f6b93b]/50 focus:border-[#f6b93b]/50 transition-all backdrop-blur-sm cursor-text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#f6b93b] to-orange-500 text-white font-bold py-3 rounded-xl hover:from-[#f6b93b]/80 hover:to-orange-500/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Plus className="inline h-5 w-5 mr-2" />
                  Create User Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal
const EditUserModal = ({ onClose, getData, user }) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:3000/api/admin/update-user/${uid}`, {
        name: name,
        email: email,
        password: password,
        uid: user._id,
      })
      .then((res) => {
        getData();
        onClose();
        toast.success("User updated successfully ");
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message || "Something is wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-600/50 transform animate-slideUp">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f6b93b]/10 to-orange-500/10"></div>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 z-10 cursor-pointer"
          onClick={onClose}
          aria-label="Close add user modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Update User</h3>
            <p className="text-gray-400 text-sm">Create a new user account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="user-name"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  className="w-full bg-gray-700/50 text-white rounded-xl border border-gray-600/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f6b93b]/50 focus:border-[#f6b93b]/50 transition-all backdrop-blur-sm cursor-text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-email"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  id="user-email"
                  type="email"
                  className="w-full bg-gray-700/50 text-white rounded-xl border border-gray-600/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f6b93b]/50 focus:border-[#f6b93b]/50 transition-all backdrop-blur-sm cursor-text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-password"
                  className="block text-gray-300 text-sm font-medium mb-2"
                >
                  <Shield className="inline h-4 w-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-gray-700/50 text-white rounded-xl border border-gray-600/50 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#f6b93b]/50 focus:border-[#f6b93b]/50 transition-all backdrop-blur-sm cursor-text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#f6b93b] to-orange-500 text-white font-bold py-3 rounded-xl hover:from-[#f6b93b]/80 hover:to-orange-500/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>Update User Account</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// User Details Modal
const UserDetailsModal = ({
  onClose,
  user,
  onOpenHoldings,
  onOpenMessages,
}) => {
  if (!user) return null;

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const profit = Number(user?.profit_price ?? 0);
  const loss = Number(user?.loss_price ?? 0);
  const totalPnL = profit - loss;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-600/50 transform animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f6b93b]/10 to-orange-500/10"></div>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 z-10 cursor-pointer"
          onClick={onClose}
          aria-label="Close user details modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10">
          {/* User Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 overflow-hidden rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg`}
            >
              <img
                src={user.avatar || "/images/user.png"}
                className="object-cover h-full w-full"
                alt="avatar"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{user.name}</h3>
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  user.is_online ? "bg-green-400" : "bg-gray-400"
                }`}
              ></div>
              <span
                className={`text-sm ${
                  user.is_online ? "text-green-400" : "text-gray-400"
                }`}
              >
                {user.is_online ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-[#f6b93b]" />
                <span className="font-medium text-gray-300">Contact Info</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-medium underline">
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-medium ${
                      user.is_blocked === false
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {user.is_blocked === false ? "ACTIVE" : "BLOCKED"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="h-5 w-5 text-[#f6b93b]" />
                <span className="font-medium text-gray-300">
                  Financial Info
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-white font-bold">
                    {formatPrice(user.capital_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total PnL:</span>
                  <div className="flex items-center gap-1">
                    {totalPnL >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span
                      className={`font-bold ${
                        totalPnL >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatPrice(totalPnL)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 bg-gradient-to-r from-[#f6b93b] to-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-[#f6b93b]/80 hover:to-orange-500/80 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              onClick={onOpenHoldings}
            >
              <Coins className="h-5 w-5" />
              View Holdings
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              onClick={onOpenMessages}
            >
              <MessageSquare className="h-5 w-5" />
              View Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirm Action Modal
const ConfirmActionModal = ({ onClose, onConfirm, message, isBlock }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-600/50 text-center transform animate-slideUp">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10"></div>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 z-10 cursor-pointer"
          onClick={onClose}
          aria-label="Close confirmation modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-4">Confirm Action</h3>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-4">
            <button
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              onClick={onConfirm}
            >
              <CheckCircle className="inline h-4 w-4 mr-2" />
              Confirm
            </button>
            <button
              className="flex-1 bg-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              onClick={onClose}
            >
              <X className="inline h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Send Message Modal
const SendMessageModal = ({ onClose, user, onSendMessage , getData }) => {
  const [messageText, setMessageText] = useState("");
  const [messageStatus, setMessageStatus] = useState(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    setMessageStatus(null);
    if (!messageText.trim()) {
      setMessageStatus({ type: "error", text: "Message cannot be empty." });
      return;
    }
    axios
      .post(`http://localhost:3000/api/admin/send-message/${uid}`, {
        uid: user._id,
        text: messageText,
      })
      .then((res) => {
        onClose();
        getData();
        toast.success(res.data.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const avatar = generateAvatar(user?.name || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl border border-gray-600/50 transform animate-slideUp">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f6b93b]/10 to-orange-500/10"></div>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 z-10 cursor-pointer"
          onClick={onClose}
          aria-label="Close send message modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Send Message</h3>
            <p className="text-gray-400 text-sm">
              Send a message to {user?.name}
            </p>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-6">
            <div>
              <label
                htmlFor="message-text"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                <MessageSquare className="inline h-4 w-4 mr-2" />
                Message
              </label>
              <textarea
                id="message-text"
                rows={7}
                placeholder="Type your message here..."
                className="w-full bg-gray-700/50 text-white placeholder-gray-400 rounded-xl border border-gray-600/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f6b93b]/50 focus:border-[#f6b93b]/50 transition-all backdrop-blur-sm resize-none cursor-text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
              ></textarea>
            </div>

            {messageStatus && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  messageStatus.type === "success"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {messageStatus.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="text-sm">{messageStatus.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#f6b93b] to-orange-500 text-white font-bold py-3 rounded-xl hover:from-[#f6b93b]/80 hover:to-orange-500/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="inline h-5 w-5 mr-2" />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Admin Page Component
const AdminPage = () => {

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showUserHoldingsModal, setShowUserHoldingsModal] = useState(false);
  const [showUserMessagesModal, setShowUserMessagesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [usersData, setUsersData] = useState(null);

  const navigate = useNavigate();

  const getData = async () => {
    axios
      .get(`http://localhost:3000/api/admin/get-all-users/${uid}`)
      .then((res) => {
        setUsersData(res.data.users);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.message === "Access denied. Admin only.") {
          navigate('/');
        }
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const handleAddUser = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleBlockUnblockUser = (user, action) => {
    setSelectedUser(user);
    setConfirmMessage(
      `Are you sure you want to ${action} ${user.name}'s account?`
    );
    setConfirmAction(() => () => {
      if (action === 'block') {
        axios
          .post(`http://localhost:3000/api/admin/block-user/${uid}`, {
             uid: user._id 
          })
          .then((res) => {
            setShowConfirmModal(false);
            getData();
            toast.success(res.data.message);
          })
          .catch((err) => {
            setShowConfirmModal(false);
               toast.error(err.response.data.message || "Something is wrong");
            console.log(err);
          });
      }else{
           axios
             .post(`http://localhost:3000/api/admin/unblock-user/${uid}`, {
               uid: user._id,
             })
             .then((res) => {
               setShowConfirmModal(false);
               getData();
               toast.success(res.data.message);
             })
             .catch((err) => {
               setShowConfirmModal(false);
               toast.error(err.response.data.message || "Something is wrong");
               console.log(err);
             });
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setConfirmMessage(
      `Are you sure you want to delete ${user.name}'s account? This action cannot be undone.`
    );
    setConfirmAction(() => () => {
      axios
        .delete(`http://localhost:3000/api/admin/delete-user/${uid}`, {
          data: { uid: user._id },
        })
        .then((res) => {
          setShowConfirmModal(false);
          getData();
          toast.success(res.data.message);
        })
        .catch((err) => {
          console.log(err);
          setShowConfirmModal(false);
          toast.error(err.response.data.message || "Something is wrong");
        });
    });
    setShowConfirmModal(true);
  };

  const handleSendMessage = (user) => {
    setSelectedUser(user);
    setShowSendMessageModal(true);
  };

  const handleUserMessageSend = (userId, message) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, messages: [...u.messages, message] } : u
      )
    );
  };

  const handleOpenHoldingsModal = () => {
    setShowUserDetailsModal(false);
    setShowUserHoldingsModal(true);
  };

  const handleOpenMessagesModal = () => {
    setShowUserDetailsModal(false);
    setShowUserMessagesModal(true);
  };


  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#1f2937",
          color: "#ffffff",
          border: "1px solid #374151",
        }}
      />
      <AdminNavbar />
      <main className="min-h-screen  bg-gray-900 text-white p-6 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-extrabold  mb-2 tracking-tight bg-gradient-to-r from-[#f6b93b] to-orange-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h2>
              <p className="text-gray-400 text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage users and track insights.
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="relative -z-[1] items-center group overflow-hidden w-36 h-11 px-4 bg-gray-800 text-white rounded-md text-base font-semibold cursor-pointer border-none"
            >
              Add User
              <span className="absolute w-48 h-28 -top-6 -left-2 bg-yellow-200 rotate-12 scale-x-0 group-hover:scale-x-100 transform transition-transform duration-300 origin-right"></span>
              <span className="absolute w-48 h-28 -top-6 -left-2 bg-yellow-400 rotate-12 scale-x-0 group-hover:scale-x-100 transform transition-transform duration-400 origin-right"></span>
              <span className="absolute w-48 h-28 -top-6 -left-2 bg-yellow-600 rotate-12 scale-x-0 group-hover:scale-x-100 transform transition-transform duration-500 origin-right"></span>
              <span className="absolute top-2.5 left-5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Grow More!
              </span>
            </button>
          </div>

          {/* Dashboard Cards */}
          <DashboardCards users={usersData} />

          {/* Users Table */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-600/40 shadow-2xl backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-700/80 to-gray-800/80">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      <User className="inline h-4 w-4 mr-2" />
                      User
                    </th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Contact
                    </th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      <DollarSign className="inline h-4 w-4 mr-2" />
                      Balance
                    </th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      <TrendingUp className="inline h-4 w-4 mr-2" />
                      PnL
                    </th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      <Activity className="inline h-4 w-4 mr-2" />
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                      <Settings className="inline h-4 w-4 mr-2" />
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {usersData?.map((user, index) => {
                    const totalPnL =
                      Number(user.profit_price) - Number(user.loss_price);
                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-700/30 transition-all duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center overflow-hidden justify-center text-white font-bold text-sm shadow-md`}
                            >
                              <img
                                src={user.avatar || "/images/user.png"}
                                className="object-cover h-full w-full"
                                alt="avatar"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {user.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    user.is_online
                                      ? "bg-green-400"
                                      : "bg-gray-400"
                                  }`}
                                ></div>
                                <span
                                  className={`text-xs ${
                                    user.is_online
                                      ? "text-green-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {user.is_online ? "Online" : "Offline"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-300 text-sm">
                            {user.email}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-white">
                            {user?.capital_price
                              ? formatPrice(
                                  Number(user.capital_price).toFixed(2)
                                )
                              : formatPrice(0)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            {totalPnL >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <span
                              className={`font-bold ${
                                totalPnL >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {formatPrice(totalPnL)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.is_blocked === false
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {user.is_blocked === false ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 bg-[#f6b93b]/20 text-[#f6b93b] rounded-lg hover:bg-[#f6b93b]/30 transition-all duration-200 border border-[#f6b93b]/30 cursor-pointer"
                              onClick={() => handleViewDetails(user)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all duration-200 border border-green-500/30 cursor-pointer"
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {user.is_blocked ? (
                              <button
                                className="p-2 rounded-lg transition-all duration-200 border cursor-pointer bg-green-600/20 text-green-400 hover:bg-green-600/30 border-green-500/30"
                                onClick={() =>
                                  handleBlockUnblockUser(user, "unblock")
                                }
                                title="Unblock User"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                className="p-2 rounded-lg transition-all duration-200 border cursor-pointer bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border-orange-500/30"
                                onClick={() =>
                                  handleBlockUnblockUser(user, "block")
                                }
                                title="Block User"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all duration-200 border border-purple-500/30 cursor-pointer"
                              onClick={() => handleSendMessage(user)}
                              title="Send Message"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-200 border border-red-500/30 cursor-pointer"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete User"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {usersData?.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddUserModal && (
          <AddUserModal
            onClose={() => setShowAddUserModal(false)}
            onAddUser={handleAddUser}
            getData={getData}
          />
        )}
        {showEditUserModal && selectedUser && (
          <EditUserModal
            onClose={() => setShowEditUserModal(false)}
            onSaveUser={handleSaveUser}
            user={selectedUser}
            getData={getData}
          />
        )}
        {showUserDetailsModal && selectedUser && (
          <UserDetailsModal
            onClose={() => setShowUserDetailsModal(false)}
            user={selectedUser}
            onOpenHoldings={handleOpenHoldingsModal}
            onOpenMessages={handleOpenMessagesModal}
          />
        )}
        {showConfirmModal && selectedUser && (
          <ConfirmActionModal
            onClose={() => setShowConfirmModal(false)}
            onConfirm={confirmAction}
            message={confirmMessage}
          />
        )}
        {showSendMessageModal && selectedUser && (
          <SendMessageModal
            onClose={() => setShowSendMessageModal(false)}
            user={selectedUser}
            onSendMessage={handleUserMessageSend}
            getData={getData}
          />
        )}
        {showUserHoldingsModal && selectedUser && (
          <UserHoldingsModal
            onClose={() => setShowUserHoldingsModal(false)}
            user={selectedUser}
          />
        )}
        {showUserMessagesModal && selectedUser && (
          <UserMessagesModal
            onClose={() => setShowUserMessagesModal(false)}
            user={selectedUser}
          />
        )}
      </main>
    </>
  );
};

export default AdminPage;
