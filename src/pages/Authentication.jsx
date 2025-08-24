import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { IoMdLock } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { setUser } from "../features/user/userSlice";

const Authentication = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    const user = useSelector((state) => state.user);
    console.log(user);
    
    
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    axios
      .post("https://grow-more-backend-zeta.vercel.app/api/auth/login", {
        email: email,
        password: password,
      })
      .then((res) => {
        console.log(res.data);
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Something went wrong");
        console.log(err);
      });
  };

const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    const token = tokenResponse.access_token;

    try {
      const res = await axios.post("https://grow-more-backend-zeta.vercel.app/api/auth/google", {
        token,
      });
      toast.success(res.data.message);
      dispatch(setUser(res.data.user));
      console.log(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.log(err);
    }
  },
  onError: () => {
    toast.error("Google Login Failed");
  },
});


  return (
    <>
      <ToastContainer />
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gray-900">
        {/* Dark Trading Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-gray-800 via-gray-700 to-gray-900 opacity-50"></div>

        {/* Trading Chart Pattern Elements */}
        <div className="absolute hidden md:block top-16 left-16 w-24 h-24 border-2 border-yellow-500 border-opacity-20 rounded-full float-element"></div>
        <div className="absolute hidden md:block bottom-16 right-16 w-32 h-32 border-2 border-yellow-500 border-opacity-10 rounded-full float-reverse"></div>
        <div className="absolute hidden md:block top-1/3 left-8 w-20 h-20 bg-yellow-500 bg-opacity-5 rounded-full pulse-gold"></div>
        <div className="absolute hidden md:block top-12 right-12 w-28 h-28 bg-yellow-500 bg-opacity-5 rounded-lg rotate-45 pulse-gold"></div>

        {/* Trading Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <div
                key={i}
                className="border border-yellow-500 border-opacity-10"
              ></div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md backdrop-blur-sm bg-gray-800 bg-opacity-90 border border-gray-700 rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="text-center space-y-3 mb-6 flex gap-5">
            {/* Trading Logo */}
            <div className="mx-auto w-16 h-16  p-2  flex items-center justify-center cursor-pointer transform hover:rotate-12 transition-transform duration-300">
              <div className="">
                <img src="/images/logo.svg" alt="Logo" className="w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl  text-white text-left font-k2d">
                GrowMore
              </h1>
              <p className="text-gray-300 text-left text-sm -mt-1">
                This trading platform is exclusively for Shahbaz Ansari
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-gray-300 font-medium text-sm"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaUser />
                </div>
                <input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
                  style={{ "--tw-ring-color": "#f6b93b" }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-gray-300 font-medium text-sm"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  <IoMdLock />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
                  style={{ "--tw-ring-color": "#f6b93b" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer text-xl"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full text-gray-900 bg-[#f6b93b] hover:bg-[#f6b93b] font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-opacity-50 mt-6"
            >
              Access Trading Platform
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-800 px-4 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          {/* <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => console.log("Google Failed")}
          /> */}
          <button
            onClick={() => login()}
            type="button"
            className="w-full bg-gray-700 border cursor-pointer border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-105 py-3 px-6 rounded-lg flex items-center justify-center space-x-2 focus:outline-none "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Authentication;
