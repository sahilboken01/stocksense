import { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PERIODS = ["1wk", "1mo", "3mo", "6mo", "1y"];

function StockChart({ symbol }) {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("1mo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);

    axios
      .get(
        `https://stocksense-1yqk.onrender.com/stock/${symbol}/history?period=${period}`
      )
      .then((res) => {
        console.log("Chart Data:", res.data);

        if (res.data.data) {
          setData(res.data.data);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Chart Error:", err);
        setLoading(false);
      });
  }, [symbol, period]);

  if (!symbol) return null;

  return (
    <div>
      {/* Period Buttons */}
      <div className="period-btns">
        {PERIODS.map((p) => (
          <button
            key={p}
            className={`period-btn ${period === p ? "active" : ""}`}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="loading">Loading chart...</div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />

              <XAxis
                dataKey="date"
                tick={{ fill: "#888899", fontSize: 11 }}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: "#888899", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />

              <Tooltip
                contentStyle={{
                  background: "#1a1a24",
                  border: "1px solid #2a2a3a",
                  borderRadius: "8px",
                  color: "#e8e8f0",
                }}
              />

              <Area
                type="monotone"
                dataKey="close"
                stroke="#7c6af7"
                strokeWidth={2}
                fill="url(#colorClose)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default StockChart;
