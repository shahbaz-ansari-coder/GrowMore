"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import axios from "axios";

const CryptoPricesTable = () => {
  const [pinnedCoins, setPinnedCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined) return "N/A";
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const formatMarketCap = useCallback((value) => {
    if (value === null || value === undefined) return "N/A";
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  }, []);


    const formatSupply = (value, symbol) => {
      if (value === null || value === undefined) return "N/A";
      if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B ${symbol.toUpperCase()}`;
      }
      if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M ${symbol.toUpperCase()}`;
      }
      return `${value.toLocaleString()} ${symbol.toUpperCase()}`;
    };

    
  const renderChangeCell = (change) => {
    if (change === null || change === undefined) return "N/A";
    const isPositive = change >= 0;
    return (
      <div
        className={`flex items-center space-x-1 ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span className="font-medium">
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>
    );
  };

  const fetchPinnedCoinsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get pinned coins from localStorage
      const favoriteCoins = JSON.parse(
        localStorage.getItem("favoriteCoins") || "[]"
      );

      if (favoriteCoins.length === 0) {
        setPinnedCoins([]);
        setLoading(false);
        return;
      }

      // Convert symbols to coin IDs for CoinGecko API
      const symbolsString = favoriteCoins.join(",");

      // Fetch data for pinned coins only
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbolsString}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );

      setPinnedCoins(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching pinned coins data:", err);
      setError("Failed to fetch pinned coins data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPinnedCoinsData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchPinnedCoinsData, 30000);

    return () => clearInterval(interval);
  }, [fetchPinnedCoinsData]);

  // Listen for localStorage changes to update when coins are pinned/unpinned
  useEffect(() => {
    const handleStorageChange = () => {
      fetchPinnedCoinsData();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchPinnedCoinsData]);

  if (loading) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mr-2" />
          <span className="text-gray-400">Loading pinned coins...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchPinnedCoinsData}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (pinnedCoins.length === 0) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No pinned coins found</p>
          <p className="text-gray-500 text-sm">
            Pin some coins from the market to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
      <div className="p-6 border-b border-gray-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Pinned Coins</h2>
            <p className="text-gray-400">
              Real-time prices for your favorite cryptocurrencies
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-gray-500 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchPinnedCoinsData}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Refresh data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr className="text-left">
              <th className="px-6 py-4 text-gray-300 font-semibold text-sm">
                #
              </th>
              <th className="px-6 py-4 text-gray-300 font-semibold text-sm">
                Name
              </th>
              <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                Price
              </th>
              <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                24h %
              </th>
              <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                Market Cap
              </th>
              <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                Volume (24h)
              </th>
              <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                Circulating Supply
              </th>
            </tr>
          </thead>
          <tbody>
            {pinnedCoins.map((coin) => (
              <tr
                key={coin.id}
                className="border-b border-gray-700/20 hover:bg-gray-800/30 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <span className="text-gray-300 font-medium">
                    {coin.market_cap_rank}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={coin.image || "/placeholder.svg"}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-white font-semibold">
                        {coin.name}
                      </div>
                      <div className="text-gray-400 text-sm uppercase">
                        {coin.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-white font-semibold text-lg">
                    {formatPrice(coin.current_price)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    {renderChangeCell(coin.price_change_percentage_24h)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-white font-medium">
                    {formatMarketCap(coin.market_cap)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-white font-medium">
                    {formatMarketCap(coin.total_volume)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-white font-medium">
                    {formatSupply(coin.circulating_supply, coin.symbol)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoPricesTable;
