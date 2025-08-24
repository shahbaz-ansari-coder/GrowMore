import React, { useEffect, useState } from "react";
import AdminMessage from "../../component/trading-dashboard/dashboard/AdminMessage";
import CryptoPricesTable from "../../component/trading-dashboard/dashboard/CryptoPrices";
import axios from "axios";
import DashboardCards from "../../component/trading-dashboard/dashboard/DashboradCards";
const uid = localStorage.getItem('uid');

const TradingDashboard = () => {
  const [data, setData] = useState(null);
  
  const getData = async () => {
        axios.get(`https://grow-more-backend-zeta.vercel.app/api/user/get-user/${uid}`)
      .then((res) => {
        setData(res.data.user)
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
      getData();
  }, []);
  
  
  return (
    <div className="space-y-8">
      {/* Admin Message */}
      {data?.messages?.length > 0 &&
        data.messages.map((item, index) => (
          <AdminMessage key={index} data={item} getData={getData} />
        ))}

      {data && Object.keys(data).length > 0 && <DashboardCards data={data} />}


      {/* Crypto Prices */}
      <CryptoPricesTable />
    </div>
  );
};

export default TradingDashboard;
