import React from 'react'
import TradingNavbar from '../navbar/Navbar'
import TradingSidebar from '../sidebar/Sidebar'
import { Outlet } from 'react-router-dom'

const TradingDashboardLayout = () => {
  return (
    <>
    <div className="flex w-full min-h-screen">
      <TradingSidebar/>
    <div className="flex flex-col w-full">
      <TradingNavbar/>
      <div className="w-full bg-gray-900 px-7 py-7 h-full">
      <Outlet/>
      </div>
    </div>
    </div>
    </>
  )
}

export default TradingDashboardLayout