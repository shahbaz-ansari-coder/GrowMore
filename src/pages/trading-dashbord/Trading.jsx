"use client";

import {
  Plus,
  X,
  Coins,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Tag,
  RotateCcw,
  RefreshCw,
  Eye,
  Wallet,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const USER_ID = localStorage.getItem("uid") || "demo-user";

// Global state for crypto data and cache
const cryptoDataCache = {
  data: [],
  timestamp: null,
  isLoading: false,
};

const priceCache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache
const CRYPTO_DATA_CACHE_DURATION = 300000; // 5 minutes cache for crypto list

// Helper functions
const getCurrencySymbol = () => "$";

const formatPrice = (price) => {
  const currencySymbol = getCurrencySymbol();
  if (price === null || price === undefined || isNaN(price)) return "N/A";

  if (price >= 1000) {
    return `${currencySymbol}${price.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  } else if (price >= 1) {
    return `${currencySymbol}${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else {
    return `${currencySymbol}${price.toFixed(6)}`;
  }
};

const formatAmount = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "N/A";
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
};

const formatPNL = (pnl) => {
  if (pnl === null || pnl === undefined || isNaN(pnl)) return "N/A";
  const isPositive = pnl >= 0;

  let formattedPnl;
  if (Math.abs(pnl) >= 1) {
    formattedPnl = pnl.toFixed(2);
  } else if (Math.abs(pnl) >= 0.01) {
    formattedPnl = pnl.toFixed(2);
  } else {
    formattedPnl = pnl.toFixed(4);
  }

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
        {isPositive ? "+" : ""}${formattedPnl}
      </span>
    </div>
  );
};

const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage))
    return "N/A";
  const isPositive = percentage >= 0;
  return (
    <span
      className={`font-semibold ${
        isPositive ? "text-green-400" : "text-red-400"
      }`}
    >
      {isPositive ? "+" : ""}
      {percentage.toFixed(2)}%
    </span>
  );
};

const fetchCachedPrice = async (coinId) => {
  const now = Date.now();
  const cached = priceCache.get(coinId);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    const price = res.data[coinId]?.usd;
    if (price) {
      priceCache.set(coinId, { price, timestamp: now });
      return price;
    }
  } catch (error) {
    console.error("Error fetching price:", error);
  }
  return null;
};

// Add Trade Modal Component
const AddTradeModal = ({
  onClose,
  onAddTrade,
  cryptoData,
  formatPrice,
  existingCoins,
  userBalance,
  setUserBalance,
  updatePnL,
}) => {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [buyPrice, setBuyPrice] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [buyTotal, setBuyTotal] = useState("");
  const [livePrice, setLivePrice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingLivePrice, setLoadingLivePrice] = useState(false);
  const [livePriceFetchError, setLivePriceFetchError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState(null)
  const fetchLivePrice = useCallback(
    async (coinId) => {
      if (!coinId) return;
      setLoadingLivePrice(true);
      setLivePriceFetchError(false);

      const price = await fetchCachedPrice(coinId);
      if (price) {
        setLivePrice(price);
        if (!buyPrice || Number.parseFloat(buyPrice) === livePrice) {
          setBuyPrice(String(price));
        }
        setLivePriceFetchError(false);
      } else {
        setLivePriceFetchError(true);
      }
      setLoadingLivePrice(false);
    },
    [buyPrice, livePrice]
  );

  useEffect(() => {
    if (selectedCoin) {
      if (selectedCoin.current_price) {
        setLivePrice(selectedCoin.current_price);
        setBuyPrice(String(selectedCoin.current_price));
        priceCache.set(selectedCoin.id, {
          price: selectedCoin.current_price,
          timestamp: Date.now(),
        });
      } else {
        setLivePrice(null);
        setBuyPrice("");
      }
      const cached = priceCache.get(selectedCoin.id);
      if (!cached || Date.now() - cached.timestamp >= CACHE_DURATION) {
        fetchLivePrice(selectedCoin.id);
      }
    } else {
      setLivePrice(null);
      setBuyPrice("");
      setLivePriceFetchError(false);
    }
  }, [selectedCoin, fetchLivePrice]);

  useEffect(() => {
    const price = Number.parseFloat(buyPrice);
    const amount = Number.parseFloat(buyAmount);
    if (!isNaN(price) && !isNaN(amount) && price > 0 && amount > 0) {
      setBuyTotal(String(price * amount));
    } else if (buyPrice === "" && buyAmount === "") {
      setBuyTotal("");
    }
  }, [buyPrice, buyAmount]);

  useEffect(() => {
    const total = Number.parseFloat(buyTotal);
    const price = Number.parseFloat(buyPrice);
    const amount = Number.parseFloat(buyAmount);

    if (!isNaN(total) && total > 0) {
      if (!isNaN(price) && price > 0) {
        setBuyAmount(String(total / price));
      } else if (!isNaN(amount) && amount > 0) {
        setBuyPrice(String(total / amount));
      } else if (livePrice && livePrice > 0) {
        setBuyAmount(String(total / livePrice));
        setBuyPrice(String(livePrice));
      }
    }
  }, [buyTotal, livePrice]);

  const handleAddTrade = async () => {
    const finalBuyPrice = Number.parseFloat(buyPrice);
    const finalBuyAmount = Number.parseFloat(buyAmount);
    const finalBuyTotal = Number.parseFloat(buyTotal);

    if (
      !selectedCoin ||
      isNaN(finalBuyPrice) ||
      isNaN(finalBuyAmount) ||
      isNaN(finalBuyTotal) ||
      finalBuyPrice <= 0 ||
      finalBuyAmount <= 0 ||
      finalBuyTotal <= 0
    ) {
      toast.error(
        "Please ensure all trade details (Price, Amount, Total) are valid numbers and greater than zero."
      );
      return;
    }

    if (finalBuyTotal > userBalance) {
      toast.error("Insufficient balance for this trade.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "https://grow-more-backend-zeta.vercel.app/api/trades/buy",
        {
          userId: USER_ID,
          coinName: selectedCoin.name,
          coinShortName: selectedCoin.symbol,
          coinImage: selectedCoin.image,
          buyPrice: finalBuyPrice,
          buyAmount: finalBuyAmount,
        }
      );

      if (response.data.trade) {
        const newTrade = {
          id: `${selectedCoin.id}-${Date.now()}`, // Unique ID for multiple trades of same coin
          tradeId: response.data.trade._id,
          coinName: selectedCoin.name,
          coinSymbol: selectedCoin.symbol,
          coinImage: selectedCoin.image,
          buyDate: response.data.trade.buyDate,
          buyTime: response.data.trade.buyTime,
          buyPrice: response.data.trade.buyPrice,
          buyAmount: response.data.trade.buyAmount,
          buyTotal: response.data.trade.buyTotal,
          status: response.data.trade.status.toLowerCase(),
          pnl: 0,
          sellDate: "Not sold",
          sellTime: "Not sold",
          sellPrice: "Not sold",
          sellAmount: "Not sold",
          sellTotal: "Not sold",
          returnPercentage: "Not sold",
        };

        setUserBalance((prev) => prev - finalBuyTotal);

        onAddTrade(newTrade);
        onClose();

        toast.success(`Successfully bought ${selectedCoin.name}!`);

        setTimeout(() => {
          updatePnL();
        }, 1000);
      }
    } catch (error) {
      console.error("Error adding trade:", error);
      toast.error(error.response?.data?.message || "Failed to add trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoins = cryptoData.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close add trade modal"
        >
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold text-white mb-6">Add New Trade</h3>

        {!selectedCoin ? (
          <>
            <div className="relative flex items-center bg-gray-700 rounded-md border border-gray-600 px-3 py-2 mb-4">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search for a coin..."
                className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {filteredCoins.map((coin) => {
                  return (
                    <div
                      key={coin.id}
                      className="flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer bg-gray-700 border-gray-600 hover:bg-gray-600"
                      onClick={() => setSelectedCoin(coin)}
                    >
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
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {formatPrice(coin.current_price)}
                        </div>
                        <div
                          className={`text-sm ${
                            coin.price_change_percentage_24h >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                          {coin.price_change_percentage_24h?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedCoin.image || "/placeholder.svg"}
                  alt={selectedCoin.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-white font-semibold text-lg">
                    {selectedCoin.name}
                  </div>
                  <div className="text-gray-400 uppercase">
                    {selectedCoin.symbol}
                  </div>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedCoin(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {livePrice && (
              <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300">Current Live Price:</span>
                  <span className="text-white font-semibold text-lg">
                    {formatPrice(livePrice)}
                  </span>
                </div>
                {loadingLivePrice && (
                  <div className="text-blue-300 text-sm mt-1">
                    Updating price...
                  </div>
                )}
                {livePriceFetchError && (
                  <div className="text-red-400 text-sm mt-1">
                    Failed to fetch live price
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Buy Price ($)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Total ($)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={buyTotal}
                  onChange={(e) => setBuyTotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => setSelectedCoin(null)}
              >
                Back
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleAddTrade}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding Trade..." : "Add Trade"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Trade Details Modal Component
const TradeDetailsModal = ({
  trade,
  onClose,
  formatPrice,
  formatAmount,
  formatPNL,
  formatPercentage,
}) => {
  if (!trade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
        <button
          className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close trade details modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <img
            src={
              trade.coinImage ||
              "/placeholder.svg?height=40&width=40&query=crypto%20coin%20icon" ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt={trade.coinName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-2xl font-bold text-white">{trade.coinName}</h3>
            <p className="text-gray-400 uppercase">{trade.coinSymbol}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Buy Details
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Buy Price:</span>
                <span className="text-white font-semibold">
                  {formatPrice(trade.buyPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-semibold">
                  {formatAmount(trade.buyAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost:</span>
                <span className="text-white font-semibold">
                  {formatPrice(trade.buyTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buy Date:</span>
                <span className="text-white">{trade.buyDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buy Time:</span>
                <span className="text-white">{trade.buyTime}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Current Status
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span
                  className={`font-semibold ${
                    trade.status === "open" ? "text-blue-400" : "text-green-400"
                  }`}
                >
                  {trade.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">PnL:</span>
                {formatPNL(trade.pnl)}
              </div>
              {trade.status === "closed" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sell Price:</span>
                    <span className="text-white font-semibold">
                      {formatPrice(trade.sellPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sell Date:</span>
                    <span className="text-white">{trade.sellDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Return %:</span>
                    {formatPercentage(trade.returnPercentage)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sell Trade Modal Component
const SellTradeModal = ({
  trade,
  onClose,
  onSellTrade,
  formatPrice,
  formatAmount,
  cryptoData,
}) => {
  const [sellPrice, setSellPrice] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [sellTotal, setSellTotal] = useState("");
  const [livePrice, setLivePrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (trade) {
      setSellAmount(String(trade.buyAmount));

      // Get live price
      const coinData = cryptoData.find(
        (coin) => coin.symbol.toLowerCase() === trade.coinSymbol.toLowerCase()
      );
      if (coinData && coinData.current_price) {
        setLivePrice(coinData.current_price);
        setSellPrice(String(coinData.current_price));
      }
    }
  }, [trade, cryptoData]);

  useEffect(() => {
    const price = Number.parseFloat(sellPrice);
    const amount = Number.parseFloat(sellAmount);
    if (!isNaN(price) && !isNaN(amount) && price > 0 && amount > 0) {
      setSellTotal(String(price * amount));
    }
  }, [sellPrice, sellAmount]);

  const handleSellTrade = async () => {
    const finalSellPrice = Number.parseFloat(sellPrice);
    const finalSellAmount = Number.parseFloat(sellAmount);
    const finalSellTotal = Number.parseFloat(sellTotal);

    if (
      isNaN(finalSellPrice) ||
      isNaN(finalSellAmount) ||
      isNaN(finalSellTotal) ||
      finalSellPrice <= 0 ||
      finalSellAmount <= 0 ||
      finalSellTotal <= 0
    ) {
      alert(
        "Please ensure all sell details are valid numbers and greater than zero."
      );
      return;
    }

    if (finalSellAmount > trade.buyAmount) {
      alert("Sell amount cannot exceed the amount you own.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "https://grow-more-backend-zeta.vercel.app/api/trades/sell",
        {
          userId: USER_ID,
          tradeId: trade.tradeId,
          sellPrice: finalSellPrice,
          sellAmount: finalSellAmount,
        }
      );

      if (response.data.trade) {
        const sellDetails = {
          sellDate: response.data.trade.sellDate,
          sellTime: response.data.trade.sellTime,
          sellPrice: response.data.trade.sellPrice,
          sellAmount: response.data.trade.sellAmount,
          sellTotal: response.data.trade.sellTotal,
          pnl: response.data.trade.pnl,
          returnPercentage: response.data.trade.returnPercentage,
          status: response.data.trade.status.toLowerCase(),
        };
        onSellTrade(trade.tradeId, sellDetails);
        onClose();
      }
    } catch (error) {
      console.error("Error selling trade:", error);
      alert(error.response?.data?.message || "Failed to sell trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!trade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
        <button
          className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close sell trade modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <img
            src={
              trade.coinImage ||
              "/placeholder.svg?height=40&width=40&query=crypto%20coin%20icon" ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt={trade.coinName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-2xl font-bold text-white">
              Sell {trade.coinName}
            </h3>
            <p className="text-gray-400 uppercase">{trade.coinSymbol}</p>
          </div>
        </div>

        {livePrice && (
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span className="text-green-300">Current Live Price:</span>
              <span className="text-white font-semibold text-lg">
                {formatPrice(livePrice)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Sell Price ($)
            </label>
            <input
              type="number"
              step="any"
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Amount (Max: {formatAmount(trade.buyAmount)})
            </label>
            <input
              type="number"
              step="any"
              max={trade.buyAmount}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Total ($)
            </label>
            <input
              type="number"
              step="any"
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={sellTotal}
              readOnly
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            onClick={handleSellTrade}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Selling..." : "Sell Trade"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Crypto Trading App Component
const CryptoTradingApp = () => {
  const [userBalance, setUserBalance] = useState(); // Default balance

  const [trades, setTrades] = useState([]);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [showTradeDetailsModal, setShowTradeDetailsModal] = useState(false);
  const [selectedTradeDetails, setSelectedTradeDetails] = useState(null);
  const [showSellTradeModal, setShowSellTradeModal] = useState(false);
  const [selectedTradeToSell, setSelectedTradeToSell] = useState(null);

  const [cryptoData, setCryptoData] = useState([]);
  const [loadingCryptoData, setLoadingCryptoData] = useState(true);
  const [errorCryptoData, setErrorCryptoData] = useState(null);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [refreshingPnL, setRefreshingPnL] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCoin, setFilterCoin] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Get existing coins to prevent duplicates
  // const existingCoins = trades.map((trade) => trade.coinSymbol);

  const fetchTrades = useCallback(async () => {
    setLoadingTrades(true);
    try {
      const response = await axios.get(
        `https://grow-more-backend-zeta.vercel.app/api/trades/get-all/${USER_ID}`
      );
      if (response.data.trades) {
        const formattedTrades = response.data.trades.map((trade) => ({
          id: trade.coinShortName,
          tradeId: trade._id,
          coinName: trade.coinName,
          coinSymbol: trade.coinShortName,
          coinImage: trade.coinImage || null, // Use saved coin image from database
          buyDate: trade.buyDate,
          buyTime: trade.buyTime,
          buyPrice: trade.buyPrice,
          buyAmount: trade.buyAmount,
          buyTotal: trade.buyTotal,
          status: trade.status.toLowerCase(),
          pnl: trade.pnl || 0,
          sellDate: trade.sellDate || "Not sold",
          sellTime: trade.sellTime || "Not sold",
          sellPrice: trade.sellPrice || "Not sold",
          sellAmount: trade.sellAmount || "Not sold",
          returnPercentage: trade.returnPercentage || "Not sold",
        }));
        setTrades(formattedTrades);
       setUserBalance(Number(response.data.balance).toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoadingTrades(false);
    }
  }, []);

  
  // Optimized crypto data fetching with global cache
  const fetchAllCryptoData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    // Use cached data if available and not expired
    if (
      !forceRefresh &&
      cryptoDataCache.data.length > 0 &&
      cryptoDataCache.timestamp &&
      now - cryptoDataCache.timestamp < CRYPTO_DATA_CACHE_DURATION
    ) {
      setCryptoData(cryptoDataCache.data);
      setLoadingCryptoData(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (cryptoDataCache.isLoading) {
      return;
    }

    cryptoDataCache.isLoading = true;
    setLoadingCryptoData(true);
    setErrorCryptoData(null);

    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d"
      );

      // Update global cache
      cryptoDataCache.data = res.data;
      cryptoDataCache.timestamp = now;
      cryptoDataCache.isLoading = false;

      setCryptoData(res.data);

      // Update price cache
      res.data.forEach((coin) => {
        if (coin.current_price) {
          priceCache.set(coin.id, {
            price: coin.current_price,
            timestamp: now,
          });
        }
      });
    } catch (err) {
      console.error("Error fetching crypto data:", err);
      setErrorCryptoData("Failed to load coin list. Please try again.");
      cryptoDataCache.isLoading = false;
    } finally {
      setLoadingCryptoData(false);
    }
  }, []);

  // Map coin images from crypto data to trades
  useEffect(() => {
    if (cryptoData.length > 0 && trades.length > 0) {
      setTrades((prevTrades) =>
        prevTrades.map((trade) => {
          // Only update if coinImage is not already saved in database
          if (!trade.coinImage) {
            const coinData = cryptoData.find(
              (coin) =>
                coin.symbol.toLowerCase() === trade.coinSymbol.toLowerCase()
            );
            return {
              ...trade,
              coinImage: coinData?.image || trade.coinImage,
              id: coinData?.id || trade.id,
            };
          }
          return trade;
        })
      );
    }
  }, [cryptoData]);

  useEffect(() => {
    fetchAllCryptoData();
    fetchTrades();
  }, [fetchAllCryptoData, fetchTrades]);

  // Update PnL only for open trades
  const updatePnL = useCallback(async () => {
    const openTrades = trades.filter((trade) => trade.status === "open");
    if (openTrades.length === 0) return;

    const coinIds = [...new Set(openTrades.map((trade) => trade.id))].join(",");
    try {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
      );

      // Update price cache
      Object.entries(res.data).forEach(([coinId, data]) => {
        if (data.usd) {
          priceCache.set(coinId, { price: data.usd, timestamp: Date.now() });
        }
      });

      setTrades((prevTrades) =>
        prevTrades.map((trade) => {
          if (trade.status === "open") {
            const currentPrice = res.data[trade.id]?.usd;
            if (currentPrice) {
              const currentTotalValue = currentPrice * trade.buyAmount;
              const pnl = currentTotalValue - trade.buyTotal;
              return { ...trade, pnl: pnl };
            }
          }
          return trade;
        })
      );
    } catch (error) {
      console.error("Error updating PnL:", error);
    }
  }, [trades]);

  // Refresh function - only fetches fresh data when explicitly called
  const handleRefresh = useCallback(async () => {
    setRefreshingPnL(true);
    try {
      // Clear caches to force fresh data
      priceCache.clear();
      cryptoDataCache.data = [];
      cryptoDataCache.timestamp = null;

      // Fetch fresh data
      await Promise.all([fetchTrades(), fetchAllCryptoData(true), updatePnL()]);

      toast.success("Portfolio data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshingPnL(false);
    }
  }, [fetchTrades, fetchAllCryptoData, updatePnL]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (trades.length > 0) {
        updatePnL();
      }
    }, 300000); // 5 minutes instead of 2

    return () => clearInterval(interval);
  }, [updatePnL, trades.length]);

  const handleAddTrade = (newTrade) => {
    setTrades((prev) => [...prev, newTrade]);
  };

  const handleViewDetails = (trade) => {
    setSelectedTradeDetails(trade);
    setShowTradeDetailsModal(true);
  };

  const handleSellTrade = (tradeId, sellDetails) => {
    setTrades((prevTrades) =>
      prevTrades.map((trade) => {
        if (trade.tradeId === tradeId) {
          return {
            ...trade,
            ...sellDetails,
          };
        }
        return trade;
      })
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCoin("all");
    setFilterStatus("all");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  // Filter trades
  const filteredTrades = trades.filter((trade) => {
    if (
      filterCoin !== "all" &&
      trade.coinSymbol.toLowerCase() !== filterCoin.toLowerCase()
    ) {
      return false;
    }

    if (filterStatus !== "all") {
      if (filterStatus === "open" && trade.status !== "open") return false;
      if (filterStatus === "closed" && trade.status !== "closed") return false;
    }

    if (filterStartDate) {
      const tradeDate = new Date(trade.buyDate);
      const startDate = new Date(filterStartDate);
      if (tradeDate < startDate) {
        return false;
      }
    }
    if (filterEndDate) {
      const tradeDate = new Date(trade.buyDate);
      const endDate = new Date(filterEndDate);
      if (tradeDate > endDate) {
        return false;
      }
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      if (
        !trade.coinName.toLowerCase().includes(lowerCaseSearchTerm) &&
        !trade.coinSymbol.toLowerCase().includes(lowerCaseSearchTerm)
      ) {
        return false;
      }
    }

    return true;
  });

  // Calculate portfolio stats
  const portfolioStats = {
    totalInvested: trades.reduce(
      (sum, trade) => sum + (trade.status === "open" ? trade.buyTotal : 0),
      0
    ),
    totalPnL: trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0),
    totalTrades: trades.length,
    openTrades: trades.filter((trade) => trade.status === "open").length,
  };

  if (loadingTrades) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-400 text-lg">
              Loading your crypto portfolio...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Crypto Trading Portfolio
          </h1>
          <p className="text-gray-400 text-lg">
            Professional cryptocurrency trading management
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-green-400" />
              <span className="text-gray-400 text-sm">Available Balance</span>
            </div>
            <div className="text-white text-xl font-bold">
              {formatPrice(userBalance)}
            </div>
          </div>
        </div>

        {/* Main Trading Panel */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Your Trades
                </h2>
                <p className="text-gray-400">
                  Track and manage your cryptocurrency positions
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  onClick={handleRefresh}
                  disabled={refreshingPnL}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshingPnL ? "animate-spin" : ""}`}
                  />
                  {refreshingPnL ? "Refreshing..." : "Refresh PnL"}
                </button>
                <button
                  className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  onClick={() => setShowAddTradeModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Trade
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative flex items-center bg-gray-700 rounded-lg border border-gray-600 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search trades..."
                  className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={filterCoin}
                  onChange={(e) => setFilterCoin(e.target.value)}
                >
                  <option value="all">All Coins</option>
                  {[...new Set(trades.map((trade) => trade.coinSymbol))].map(
                    (symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol.toUpperCase()}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <input
                type="date"
                className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                placeholder="Start Date"
              />

              <input
                type="date"
                className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-700 text-gray-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </div>

          {/* Trades Table */}
          <div className="overflow-x-auto">
            {filteredTrades.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">No trades found</div>
                <div className="text-sm">
                  {trades.length === 0
                    ? "Start by adding your first trade"
                    : "Try adjusting your filters or search terms"}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-gray-300 font-semibold text-sm">
                      Coin
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                      Buy Price
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                      Buy Date
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                      Buy Date
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                      Status
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold text-sm text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr
                      key={trade.tradeId}
                      className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors duration-200 cursor-pointer"
                      onClick={() => handleViewDetails(trade)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              trade.coinImage ||
                              "/placeholder.svg?height=32&width=32&query=crypto%20coin%20icon" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={trade.coinName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-white font-semibold">
                              {trade.coinName}
                            </div>
                            <div className="text-gray-400 text-sm uppercase">
                              {trade.coinSymbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-semibold">
                          {formatPrice(trade.buyPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-white font-medium">
                          {formatAmount(trade.buyAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-gray-300">
                          {trade.buyDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-gray-400">
                          {trade.buyTime}
                        </div>
                  
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-semibold text-sm px-2 py-1 rounded-full ${
                            trade.status === "open"
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-green-900/30 text-green-400"
                          }`}
                        >
                          {trade.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(trade);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          {trade.status === "open" && (
                            <button
                              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTradeToSell(trade);
                                setShowSellTradeModal(true);
                              }}
                            >
                              Sell
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

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

        {/* Modals */}
        {showAddTradeModal && (
          <AddTradeModal
            onClose={() => setShowAddTradeModal(false)}
            onAddTrade={handleAddTrade}
            cryptoData={cryptoData}
            formatPrice={formatPrice}
            existingCoins={[]}
            userBalance={userBalance}
            setUserBalance={setUserBalance}
            updatePnL={updatePnL}
          />
        )}

        {showTradeDetailsModal && (
          <TradeDetailsModal
            trade={selectedTradeDetails}
            onClose={() => {
              setShowTradeDetailsModal(false);
              setSelectedTradeDetails(null);
            }}
            formatPrice={formatPrice}
            formatAmount={formatAmount}
            formatPNL={formatPNL}
            formatPercentage={formatPercentage}
          />
        )}

        {showSellTradeModal && (
          <SellTradeModal
            trade={selectedTradeToSell}
            onClose={() => {
              setShowSellTradeModal(false);
              setSelectedTradeToSell(null);
            }}
            onSellTrade={handleSellTrade}
            formatPrice={formatPrice}
            formatAmount={formatAmount}
            cryptoData={cryptoData}
          />
        )}
      </div>
    </div>
  );
};

export default CryptoTradingApp;
