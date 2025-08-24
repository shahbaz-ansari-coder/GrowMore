"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, Info, Search, X, Pin } from "lucide-react";
import axios from "axios";

// CoinDetailsModal component (now inline)
const CoinDetailsModal = ({ coin, onClose, formatPrice }) => {
  if (!coin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
        <button
          className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={coin.image || "/placeholder.svg"}
            alt={coin.name}
            className="h-12 w-12 rounded-full"
          />
          <div>
            <h3 className="text-3xl font-bold text-white">{coin.name}</h3>
            <p className="text-gray-400 text-lg uppercase">{coin.symbol}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">Current Price:</span>
            <span className="text-white font-semibold text-xl">
              {formatPrice(coin.current_price)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">Market Cap Rank:</span>
            <span className="text-white">{coin.market_cap_rank}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">24h High:</span>
            <span className="text-green-400">{formatPrice(coin.high_24h)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">24h Low:</span>
            <span className="text-red-400">{formatPrice(coin.low_24h)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">All-Time High (ATH):</span>
            <span className="text-white">{formatPrice(coin.ath)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">ATH Date:</span>
            <span className="text-white">
              {new Date(coin.ath_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">All-Time Low (ATL):</span>
            <span className="text-white">{formatPrice(coin.atl)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">ATL Date:</span>
            <span className="text-white">
              {new Date(coin.atl_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">Total Supply:</span>
            <span className="text-white">
              {coin.total_supply?.toLocaleString() || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 py-2">
            <span className="font-medium">Max Supply:</span>
            <span className="text-white">
              {coin.max_supply?.toLocaleString() || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Last Updated:</span>
            <span className="text-white">
              {new Date(coin.last_updated).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoinMarket = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteCoins, setFavoriteCoins] = useState(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("favoriteCoins");
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoinDetails, setSelectedCoinDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // New state for active filter

  // Persist favorite coins to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteCoins", JSON.stringify(favoriteCoins));
    }
  }, [favoriteCoins]);

  const getData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Added price_change_percentage=7d to fetch 7-day data
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d`
      );
      setCryptoData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch cryptocurrency data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  // Hardcode USD symbol as currency selection is removed
  const getCurrencySymbol = () => "$";

  const formatPrice = useCallback((price) => {
    const currencySymbol = getCurrencySymbol();
    if (price === null || price === undefined) return "N/A";
    if (price < 1) {
      return `${currencySymbol}${price.toFixed(4)}`;
    }
    return `${currencySymbol}${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const formatMarketCap = useCallback((value) => {
    const currencySymbol = getCurrencySymbol();
    if (value === null || value === undefined) return "N/A";
    if (value >= 1e12) {
      return `${currencySymbol}${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `${currencySymbol}${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${currencySymbol}${(value / 1e6).toFixed(2)}M`;
    }
    return `${currencySymbol}${value.toLocaleString()}`;
  }, []);

  const formatVolume = useCallback((value) => {
    const currencySymbol = getCurrencySymbol();
    if (value === null || value === undefined) return "N/A";
    if (value >= 1e9) {
      return `${currencySymbol}${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${currencySymbol}${(value / 1e6).toFixed(2)}M`;
    }
    return `${currencySymbol}${value.toLocaleString()}`;
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

  const toggleFavorite = (symbol) => {
    setFavoriteCoins((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const isFavorite = (symbol) => favoriteCoins.includes(symbol);

  const handleCoinClick = (coin) => {
    setSelectedCoinDetails(coin);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCoinDetails(null);
  };

  // Filter and sort logic based on search term and active filter
  const filteredAndSortedCryptoData = (() => {
    let processedData = cryptoData.filter((coin) => {
      return (
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const TOP_N = 10; // Number of top gainers/losers/volume to show

    if (activeFilter === "gainers24h") {
      processedData.sort(
        (a, b) =>
          (b.price_change_percentage_24h || 0) -
          (a.price_change_percentage_24h || 0)
      );
      processedData = processedData.slice(0, TOP_N);
    } else if (activeFilter === "losers24h") {
      processedData.sort(
        (a, b) =>
          (a.price_change_percentage_24h || 0) -
          (b.price_change_percentage_24h || 0)
      );
      processedData = processedData.slice(0, TOP_N);
    } else if (activeFilter === "volume24h") {
      processedData.sort(
        (a, b) => (b.total_volume || 0) - (a.total_volume || 0)
      );
      processedData = processedData.slice(0, TOP_N);
    } else if (activeFilter === "gainers7d") {
      processedData.sort(
        (a, b) =>
          (b.price_change_percentage_7d_in_currency || 0) -
          (a.price_change_percentage_7d_in_currency || 0)
      );
      processedData = processedData.slice(0, TOP_N);
    } else if (activeFilter === "losers7d") {
      processedData.sort(
        (a, b) =>
          (a.price_change_percentage_7d_in_currency || 0) -
          (b.price_change_percentage_7d_in_currency || 0)
      );
      processedData = processedData.slice(0, TOP_N);
    }
    // If activeFilter is "all", no additional sorting/slicing is needed beyond the search filter.
    return processedData;
  })();

  const filterButtons = [
    { label: "All", value: "all" },
    { label: "Top Gainers (24h)", value: "gainers24h" },
    { label: "Top Losers (24h)", value: "losers24h" },
    { label: "Top Gainers (7d)", value: "gainers7d" },
    { label: "Top Losers (7d)", value: "losers7d" },
    { label: "Most Volume (24h)", value: "volume24h" },
  ];

  return (
    <>
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Crypto Currency Prices
              </h2>
              <p className="text-gray-400">Live market data and rankings</p>
            </div>
            <div className="relative flex items-center bg-gray-800 rounded-md border border-gray-700 px-3 py-2 w-full md:w-auto">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search coins..."
                className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-5 mt-4">
            {filterButtons.map((button) => (
              <button
                key={button.value}
                className={`px-4 py-2 rounded-md text-sm cursor-pointer hover:scale-105 font-medium transition-colors duration-200 ${
                  activeFilter === button.value
                    ? "bg-primary"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setActiveFilter(button.value)}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading data...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-400">{error}</div>
          ) : filteredAndSortedCryptoData.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No coins found.</div>
          ) : (
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
                    <div className="flex items-center justify-end space-x-1">
                      <span>Market Cap</span>
                      <Info className="h-3 w-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Volume(24h)</span>
                      <Info className="h-3 w-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Circulating Supply</span>
                      <Info className="h-3 w-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                    Pin
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCryptoData.map((coin) => (
                  <tr
                    key={coin.id}
                    className="border-b border-gray-700/20 hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleCoinClick(coin)}
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
                            {coin.name.length > 8
                              ? `${coin.name.slice(0, 5)}...`
                              : coin.name}
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
                    <td className="px-6 py-4 text-right flex justify-end items-center mt-3">
                      {renderChangeCell(coin.price_change_percentage_24h)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-medium">
                        {formatMarketCap(coin.market_cap)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-medium">
                        {formatVolume(coin.total_volume)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-medium">
                        {formatSupply(coin.circulating_supply, coin.symbol)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-yellow-400"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from triggering
                          toggleFavorite(coin.symbol);
                        }}
                        aria-label={
                          isFavorite(coin.symbol)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Pin
                          className={`h-5 w-5 rotate-90 cursor-pointer ${
                            isFavorite(coin.symbol)
                              ? "fill-yellow-400 text-yellow-400 "
                              : ""
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showDetailsModal && (
        <CoinDetailsModal
          coin={selectedCoinDetails}
          onClose={handleCloseDetailsModal}
          formatPrice={formatPrice}
        />
      )}
    </>
  );
};

export default CoinMarket;
