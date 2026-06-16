from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd

app = FastAPI()

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── NSE stock symbols (add .NS for Yahoo Finance) ──
POPULAR_STOCKS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS",
    "WIPRO.NS", "TATAMOTORS.NS", "SBIN.NS", "ADANIENT.NS"
]

# ── 1. Home route — just to test if server is running ──
@app.get("/")
def home():
    return {"message": "StockSense API is running!"}


# ── 2. Get stock info + current price ──
@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    ticker = yf.Ticker(symbol + ".NS")
    info = ticker.fast_info

    return {
        "symbol": symbol,
        "name": symbol,
        "price": info.get("lastPrice", 0),
        "change": 0,
        "change_percent": round(info.get("yearChange", 0) * 100, 2),
        "market_cap": info.get("marketCap", 0),
        "volume": info.get("lastVolume", 0),
        "high": info.get("dayHigh", 0),
        "low": info.get("dayLow", 0),
        "open": info.get("open", 0),
    }


# ── 3. Get historical price data for chart ──
@app.get("/stock/{symbol}/history")
def get_history(symbol: str, period: str = "1mo"):
    ticker = yf.Ticker(symbol + ".NS")
    hist = ticker.history(period=period)
    data = []
    for date, row in hist.iterrows():
        data.append({
            "date": str(date.date()),
            "open": round(row["Open"], 2),
            "close": round(row["Close"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "volume": int(row["Volume"])
        })
    return {"symbol": symbol, "period": period, "data": data}


# ── 4. Get multiple popular stocks at once ──
@app.get("/stocks/popular")
def get_popular_stocks():
    result = []
    for symbol in POPULAR_STOCKS:
        try:
            info = ticker.fast_info

         info = ticker.info
          result.append({
    "symbol": symbol.replace(".NS", ""),
    "name": symbol.replace(".NS", ""),
    "price": info.get("lastPrice", 0),
    "change_percent": round(info.get("yearChange", 0) * 100, 2),
})
        except:
            pass
    return result


# ── 5. Search for any stock ──
@app.get("/search/{query}")
def search_stock(query: str):
    symbol = query.upper() + ".NS"
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info
        if info.get("lastPrice"):
            return {
                "found": True,
                "symbol": query.upper(),
                "name": info.get("longName", query),
                "price": info.get("lastPrice", 0),
            }
        else:
            return {"found": False, "message": "Stock not found"}
    except:
        return {"found": False, "message": "Error fetching stock"}
@app.get("/debug")
def debug():
    ticker = yf.Ticker("RELIANCE.NS")

    try:
        return dict(ticker.fast_info)
    except Exception as e:
        return {"error": str(e)}