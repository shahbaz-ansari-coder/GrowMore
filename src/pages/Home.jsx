"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X, TrendingUp, BarChart3, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function PyramidLoaderPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setTimeout(() => setShowContent(true), 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gray-900">
      {/* Dark Trading Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-gray-800 via-gray-700 to-gray-900 opacity-50"></div>

      {/* Trading Chart Pattern Elements */}
      <div className="absolute top-16 left-16 w-24 h-24 border-2 border-yellow-500 border-opacity-20 rounded-full float-element"></div>
      <div className="absolute bottom-16 right-16 w-32 h-32 border-2 border-yellow-500 border-opacity-10 rounded-full float-reverse"></div>
      <div className="absolute top-1/3 left-8 w-20 h-20 bg-yellow-500 bg-opacity-5 rounded-full pulse-gold"></div>
      <div className="absolute top-12 right-12 w-28 h-28 bg-yellow-500 bg-opacity-5 rounded-lg rotate-45 pulse-gold"></div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto text-center">
        {/* Header Text */}
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-2">
            <span className="text-yellow-400 text-sm font-medium tracking-wider uppercase">
              Private Trading Platform
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            Shahbaz Ansari
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-200 mb-4">
            Professional Trading Hub
          </h2>
          <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Advanced Paper Trading Environment • Risk-Free Skill Development •
            Real-Time Market Analysis
          </p>
        </div>

        {/* Pyramid Loader */}
        <div className="pyramid-loader">
          <div className="wrapper">
            <span className="side side1"></span>
            <span className="side side2"></span>
            <span className="side side3"></span>
            <span className="side side4"></span>
            <span className="shadow"></span>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Initializing Your Trading Environment</span>
            <span>{isLoaded ? "100%" : "0%"}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-2000 ease-out ${
                isLoaded ? "w-full" : "w-0"
              }`}
            ></div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className={`w-full max-w-md mx-auto flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${
            showContent
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <Link to={'/auth'} className="w-full">
          <button
            size="lg"
            className="bg-gradient-to-r w-full cursor-pointer flex justify-center items-center gap-2 from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
