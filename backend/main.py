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
    info = ticker.info
    return {
        "symbol": symbol,
        "name": info.get("longName", symbol),
        "price": info.get("currentPrice", 0),
        "change": info.get("regularMarketChange", 0),
        "change_percent": info.get("regularMarketChangePercent", 0),
        "market_cap": info.get("marketCap", 0),
        "volume": info.get("volume", 0),
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
            ticker = yf.Ticker(symbol)
            info = ticker.info
            result.append({
                "symbol": symbol.replace(".NS", ""),
                "name": info.get("longName", symbol),
                "price": info.get("currentPrice", 0),
                "change_percent": round(info.get("regularMarketChangePercent", 0), 2),
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
        info = ticker.info
        if info.get("currentPrice"):
            return {
                "found": True,
                "symbol": query.upper(),
                "name": info.get("longName", query),
                "price": info.get("currentPrice", 0),
            }
        else:
            return {"found": False, "message": "Stock not found"}
    except:
        return {"found": False, "message": "Error fetching stock"}
