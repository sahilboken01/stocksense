function StockCard({ stock, isActive, onClick,onAddWatchlist }) {
    const isPositive = stock.change_percent >= 0;
  
    return (
      <div
        className={`stock-card ${isActive ? "active" : ""}`}
        onClick={() => onClick(stock.symbol)}
      >
        <div className="stock-symbol">{stock.symbol}</div>
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div className="stock-name">{stock.name}</div>

  <button
    onClick={(e) => {
      e.stopPropagation();
      onAddWatchlist(stock.symbol);
    }}
    style={{
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "18px",
    }}
  >
    ⭐
  </button>
</div>
        <div className="stock-price">₹{stock.price?.toLocaleString("en-IN")}</div>
        <div className={`stock-change ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(stock.change_percent).toFixed(2)}%
        </div>
      </div>
    );
  }
  
  export default StockCard;
  