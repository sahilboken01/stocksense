from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://stocksense-swart.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

POPULAR_STOCKS = [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "WIPRO.NS",
    "TATAMOTORS.NS",
    "SBIN.NS",
    "ADANIENT.NS",
]


@app.get("/")
def home():
    return {"message": "StockSense API is running!"}


@app.get("/stock/{symbol}")
def get_stock(symbol: str):
    try:
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

    except Exception as e:
        return {"error": str(e)}


@app.get("/stock/{symbol}/history")
def get_history(symbol: str, period: str = "1mo"):
    try:
        ticker = yf.Ticker(symbol + ".NS")
        hist = ticker.history(period=period)

        if hist.empty:
            return {
                "symbol": symbol,
                "period": period,
                "data": []
            }

        data = []

        for date, row in hist.iterrows():
            data.append({
                "date": str(date.date()),
                "open": float(row["Open"]) if not pd.isna(row["Open"]) else 0,
                "close": float(row["Close"]) if not pd.isna(row["Close"]) else 0,
                "high": float(row["High"]) if not pd.isna(row["High"]) else 0,
                "low": float(row["Low"]) if not pd.isna(row["Low"]) else 0,
                "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0,
            })

        return {
            "symbol": symbol,
            "period": period,
            "data": data,
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/stocks/popular")
def get_popular_stocks():
    result = []

    for symbol in POPULAR_STOCKS:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.fast_info

            year_change = info.get("yearChange", 0)

            # Handle None and NaN safely
            if year_change is None:
                year_change = 0

            try:
                year_change = float(year_change)
            except:
                year_change = 0

            if year_change != year_change:  # NaN check
                year_change = 0

            price = info.get("lastPrice", 0)

            try:
                price = float(price)
            except:
                price = 0

            result.append({
                "symbol": symbol.replace(".NS", ""),
                "name": symbol.replace(".NS", ""),
                "price": price,
                "change_percent": round(year_change * 100, 2),
            })

        except Exception as e:
            print(f"Error fetching {symbol}: {e}")

    return result


@app.get("/search/{query}")
def search_stock(query: str):
    try:
        symbol = query.upper() + ".NS"

        ticker = yf.Ticker(symbol)
        info = ticker.fast_info

        if info.get("lastPrice"):
            return {
                "found": True,
                "symbol": query.upper(),
                "name": query.upper(),
                "price": info.get("lastPrice", 0),
            }

        return {
            "found": False,
            "message": "Stock not found",
        }

    except Exception:
        return {
            "found": False,
            "message": "Error fetching stock",
        }


@app.get("/debug")
def debug():
    ticker = yf.Ticker("RELIANCE.NS")

    try:
        return dict(ticker.fast_info)
    except Exception as e:
        return {"error": str(e)}