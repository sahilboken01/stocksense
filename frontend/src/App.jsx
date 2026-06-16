import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import StockCard from "./components/StockCard";
import StockChart from "./components/StockChart";
import SearchBar from "./components/SearchBar";

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [watchlist, setWatchlist] = useState([]);

  // Load popular stocks on page load
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/stocks/popular")
      .then((res) => {
        setStocks(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load popular stocks");
        setLoading(false);
      });
  }, []);
  // Load watchlist from localStorage
useEffect(() => {
  const saved = localStorage.getItem("watchlist");

  if (saved) {
    setWatchlist(JSON.parse(saved));
  }
}, []);

  // Load stock detail when a card is clicked
  const handleSelectStock = (symbol) => {
    setSelectedSymbol(symbol);
    setDetailLoading(true);
    axios
      .get(`http://127.0.0.1:8000/stock/${symbol}`)
      .then((res) => {
        setSelectedStock(res.data);
        setDetailLoading(false);
      })
      .catch(() => {
        setError(`Failed to load stock ${symbol}`);
        setDetailLoading(false);
      });
  };

  // Handle search result
  const handleSearchResult = (result) => {
    handleSelectStock(result.symbol);
  };

  const addToWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) return;
  
    const updated = [...watchlist, symbol];
  
    console.log("Saving:", updated);
  
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };
  const removeFromWatchlist = (symbol) => {
    const updated = watchlist.filter(
      (item) => item !== symbol
    );
  
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };
  
  const isPositive = selectedStock?.change_percent >= 0;
  
  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div>
          <div className="nav-logo">Stock<span>Sense</span></div>
          <div className="nav-subtitle">NSE Stock Analytics Dashboard</div>
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          Built by Sahil Boken
        </div>
      </nav>

      <div className="main">
      {error && (
  <div
    style={{
      background: "#441111",
      color: "#ff8888",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
    }}
  >
    {error}
  </div>
)}
        <div className="hero">
          <h1>Track <span>NSE Stocks</span> in Real Time</h1>
          <p>Live prices, historical charts, and market data for top Indian stocks</p>
          <SearchBar onResult={handleSearchResult} />
        </div>

        {watchlist.length > 0 && (
  <>
    <div className="section-title">⭐ Watchlist</div>

    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "20px",
      }}
    >{watchlist.map((symbol) => (
      <div
        key={symbol}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          onClick={() => handleSelectStock(symbol)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            border: "1px solid #444",
          }}
        >
          {symbol}
        </button>
    
        <button
          onClick={() => removeFromWatchlist(symbol)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ❌
        </button>
      </div>
    ))}
    </div>
  </>
)}
        <div className="section-title">Popular Stocks</div>
        {loading ? (
          <div className="loading">Loading stocks...</div>
        ) : (
          <div className="stocks-grid">
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                isActive={selectedSymbol === stock.symbol}
                onClick={handleSelectStock}
                onAddWatchlist={addToWatchlist}
              />
            ))}
          </div>
        )}

        {/* STOCK DETAIL */}
        {selectedSymbol && (
          <div className="detail-panel">
            {detailLoading ? (
              <div className="loading">Loading details...</div>
            ) : selectedStock ? (
              <>
                <div className="detail-header">
                  <div>
                    <div className="detail-name">{selectedStock.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      {selectedStock.symbol} · NSE
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="detail-price">
                      ₹{selectedStock.price?.toLocaleString("en-IN")}
                    </div>
                    <div className={`stock-change ${isPositive ? "positive" : "negative"}`}>
                      {isPositive ? "▲" : "▼"} {Math.abs(selectedStock.change_percent).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* STATS */}
                <div className="detail-stats">
                  <div className="stat-box">
                    <div className="stat-label">Open</div>
                    <div className="stat-value">₹{selectedStock.open?.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Day High</div>
                    <div className="stat-value" style={{ color: "var(--green)" }}>
                      ₹{selectedStock.high?.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Day Low</div>
                    <div className="stat-value" style={{ color: "var(--red)" }}>
                      ₹{selectedStock.low?.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Volume</div>
                    <div className="stat-value">{selectedStock.volume?.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Market Cap</div>
                    <div className="stat-value">
                      ₹{(selectedStock.market_cap / 1e9).toFixed(0)}B
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Change</div>
                    <div className={`stat-value ${isPositive ? "positive" : "negative"}`}
                      style={{ color: isPositive ? "var(--green)" : "var(--red)" }}>
                      {isPositive ? "+" : ""}{selectedStock.change?.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* CHART */}
                <StockChart symbol={selectedSymbol} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;