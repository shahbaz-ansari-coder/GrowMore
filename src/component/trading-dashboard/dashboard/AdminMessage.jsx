import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import axios from "axios";
const uid = localStorage.getItem("uid");

const AdminMessage = ({ data }) => {
  const dateObj = new Date(data.sentAt);

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short", // Aug
    day: "numeric", // 20
    year: "numeric", // 2025
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // 11:52 AM
  });

  const handleDelete = async () => {
    axios
      .post(`http://localhost:3000/api/user/delete-message`, {
        uid: uid,
        messageId: data._id,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col sm:flex-row items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 mt-2 sm:mt-0">
              <h3 className="text-lg font-bold text-white">
                Message from Shahbaz
              </h3>
              <span className="px-3 py-1 hidden sm:block bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                New
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              {data.text}
            </p>

            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-white hover:rotate-90  hover:scale-115  cursor-pointer  transition-all duration-200 p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default AdminMessage;
