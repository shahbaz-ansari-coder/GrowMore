import {
  CreditCard,
  TrendingUp,
  BarChart3,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const DashboardCards = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Card 1 - Total Balance */}
      <div className="group relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-yellow-500/30 transition-all duration-300 hover:transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">
            Total Balance
          </h3>
          <p className="text-xl lg:text-2xl font-bold text-white">
            ${data.capital_price ? Number(data.capital_price).toFixed(2) : "0"}
          </p>

          <div className="mt-3 flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Available Balance
          </div>
        </div>
      </div>

      {/* Card 2 - Today's P&L */}
      <div className="group relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-emerald-500/30 transition-all duration-300 hover:transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">
            Today's P&L
          </h3>
          <p className="text-xl lg:text-2xl font-bold text-white">
            {Number(data.profit_price) - Number(data.loss_price) >= 0
              ? `+$${(
                  Number(data.profit_price) - Number(data.loss_price)
                ).toFixed(2)}`
              : `-$${Math.abs(
                  Number(data.profit_price) - Number(data.loss_price)
                ).toFixed(2)}`}
          </p>
          <div className="mt-3 flex items-center text-xs">
            {Number(data.profit_price) - Number(data.loss_price) >= 0 ? (
              <div className="flex items-center text-emerald-400">
                <ArrowUp className="w-3 h-3 mr-1" />
                Profit
              </div>
            ) : (
              <div className="flex items-center text-red-400">
                <ArrowDown className="w-3 h-3 mr-1" />
                Loss
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3 - Active Positions */}
      <div className="group relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-blue-500/30 transition-all duration-300 hover:transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">
            Active Positions
          </h3>
          <p className="text-xl lg:text-2xl font-bold text-white">
            {data.trades.filter((trade) => trade.status === "OPEN").length}
          </p>

          <div className="mt-3 flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Live Trading
          </div>
        </div>
      </div>

      {/* Card 4 - Total Profit */}
      <div className="group relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">
            Total Profit
          </h3>
          <p className="text-xl lg:text-2xl font-bold text-white">
            $
            {data.capital_price ? Number(data.profit_price).toFixed(2) : "0.00"}
          </p>

          <div className="mt-3 flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            All Time
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
