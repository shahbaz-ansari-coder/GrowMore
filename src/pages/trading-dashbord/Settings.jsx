"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Key,
  MessageSquare,
  Info,
  ImageIcon,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Github,
  Linkedin,
  Twitter,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";
import axios from "axios";
const uid = localStorage.getItem("uid");
import { ToastContainer, toast } from "react-toastify"
import { FaWhatsapp } from "react-icons/fa6";

// Avatar Selection Modal Component
const AvatarSelectionModal = ({ onClose, onSelectAvatar  , selectedAvatar}) => {

  const handleChange = async (avatar) => {
     axios
       .post(`http://localhost:3000/api/user/update-avatar/${uid}`, {
         avatar: avatar,
       })
       .then((res) => {
         onSelectAvatar(avatar);
       })
       .catch((err) => {
         console.log(err);
       })
       .finally(() => {
         location.reload();
       });
  };

 const avatars = [
   {
     name: "Avatar 1",
     url: "https://i.pinimg.com/736x/f4/a3/4e/f4a34ef7fd2f8d3a347a8c0dfb73eece.jpg",
   },
   {
     name: "Avatar 2",
     url: "https://backiee.com/static/wallpapers/1920x1080/386745.jpg",
    },
    {
      name: "Avatar 3",
      url: "https://img6.arthub.ai/64a007fc-a355.webp",
    },
    {
      name: "Avatar 4",
      url: "https://wallpapercave.com/wp/wp11742613.jpg",
   },
   {
     name: "Avatar 5",
     url: "https://img.freepik.com/premium-photo/ai-generated-illustration-front-view-male-trader-doing-analysis-trading_441362-4692.jpg",
    },
    {
      name: "Avatar 6",
      url: "https://img.freepik.com/premium-photo/ai-generated-illustration-front-view-male-trader-doing-analysis-trading_441362-4691.jpg",
    },
   {
     name: "Avatar 7",
     url: "https://i.pinimg.com/736x/18/5a/f6/185af6cbdccbf5c7c7c34921c0794d5f.jpg",
   },
   {
     name: "Avatar 8",
     url: "https://photosnow.org/wp-content/uploads/2024/04/Anime-DP_10.jpg",
   },
   {
     name: "Avatar 9",
     url: "https://i.pinimg.com/736x/ea/b6/20/eab6203681c0493206436b91bd376752.jpg",
   },
 ];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
        <button
          className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close avatar selection modal"
        >
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Select Your Avatar
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 cursor-pointer"
                onClick={()=> handleChange(avatar.url)}
              >
              <button
                className={`flex items-center cursor-pointer hover:scale-[1.08]  justify-center rounded-full transition-all duration-200 ${
                  selectedAvatar === avatar.url
                  ? "ring-4 ring-primary shadow-lg"
                  : "hover:opacity-80"
                }`}
              >
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-20 h-20 rounded-full object-cover transition-transform duration-200 group-hover:scale-110"
                />
              </button>

              {/* Agar ye selected avatar hai to "Selected" dikhao warna name */}
              <span
                className={`text-sm font-medium ${
                  selectedAvatar === avatar.url
                    ? "text-primary"
                    : "text-gray-300"
                }`}
              >
                {selectedAvatar === avatar.url ? "Selected" : avatar.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ onClose, userId }) => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All fields are required.")
      return
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation do not match.")
      return
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(
        `http://localhost:3000/api/user/update-password/${uid}`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      toast.success(response.data.message || "Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      // Close modal after successful update
      setTimeout(onClose, 2000)
    } catch (error) {
      console.error("Error updating password:", error)
      const errorMessage = error.response?.data?.message || "Network error. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
        <button
          className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close change password modal"
        >
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-gray-300 text-sm font-medium mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className="block text-gray-300 text-sm font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-gray-300 text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-semibold py-3 rounded-md hover:bg-primary/90 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Confirm Change"}
          </button>
        </form>
      </div>
    </div>
  )
}


// Main Settings Page Component
const SettingsPage = () => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [selectedAvatar, setSelectedAvatar] = useState("/images/user.png");
  const [data, setData] = useState(null);

  const getData = async () => {
    axios
      .get(`http://localhost:3000/api/user/get-user/${uid}`)
      .then((res) => {
        setData(res.data.user);
        setSelectedAvatar(res.data.user.avatar);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSelectAvatar = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    setShowAvatarModal(false);
  };

  // WhatsApp pre-filled message (edit freely)
const waMessage = encodeURIComponent(
  `Hi Shahbaz! I'm ${data?.name}, from GrowMore`
);



  const waLink = `https://wa.me/923074963450?text=${waMessage}`;


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
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden p-6">
        <h2 className="text-3xl font-bold text-white mb-8">Account Settings</h2>

        {/* Avatar Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Profile Picture
          </h3>
          <div className="flex flex-col items-center gap-4">
            <img
              src={selectedAvatar || "/images/user.png"}
              alt="User "
              className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            />
            <button
              className="bg-gray-700 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
              onClick={() => setShowAvatarModal(true)}
            >
              <ImageIcon className="h-4 w-4" />
              Change Avatar
            </button>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-gray-400" />
            Account Information
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between items-center border-b border-gray-700 py-2">
              <span className="font-medium">Name:</span>
              <span className="text-white">{data?.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 py-2">
              <span className="font-medium">Email:</span>
              <span className="text-white">{data?.email}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-700 py-2">
              <span className="font-medium">Total Balance:</span>
              <span className="text-white">
                $
                {data?.capital_price
                  ? Number(data?.capital_price).toFixed(2)
                  : "0"}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-700 py-2">
              <span className="font-medium">Total Trades:</span>
              <span className="text-white">{data?.trades.length}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 py-2">
              <span className="font-medium">Total Loss:</span>
              <span className="text-white">
                ${data?.loss_price ? Number(data?.loss_price).toFixed(2) : "0"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Total Profit:</span>
              <span className="text-white">
                $
                {data?.profit_price
                  ? Number(data?.profit_price).toFixed(2)
                  : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-400" />
            Password
          </h3>
          <button
            className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>

        {/* About Us Card */}
        <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center justify-center gap-2">
            <Info className="h-5 w-5 text-gray-400" />
            About This Website
          </h3>
          <p className="text-gray-300 text-lg">
            This website was made by{" "}
            <span className="font-bold text-primary underline">
              <a href="https://www.shahbazansari.site/">Shahbaz Ansari</a>
            </span>
            .
          </p>
          <div className="flex justify-center gap-4 mt-4">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61561335181043"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors group"
              aria-label="Facebook"
              title="Facebook"
            >
              <Facebook className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="sr-only">Facebook</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/shahbaz_ansari_2007/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors group"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="sr-only">Instagram</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.linkedin.com/in/shahbaz-web-developer/?originalSubdomain=pk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors group"
              aria-label="Instagram"
              title="Instagram"
            >
              <Linkedin className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="sr-only">Linkedin</span>
            </a>

            {/* WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors group"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              {/* If your lucide-react version has Whatsapp, use <Whatsapp className="h-6 w-6 ..." /> */}
              <FaWhatsapp className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="sr-only">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <AvatarSelectionModal
          onClose={() => setShowAvatarModal(false)}
          onSelectAvatar={handleSelectAvatar}
          selectedAvatar={selectedAvatar}
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};

export default SettingsPage;
