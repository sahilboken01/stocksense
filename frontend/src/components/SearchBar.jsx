import { useState } from "react";
import axios from "axios";

function SearchBar({ onResult }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`https://stocksense-1yqk.onrender.com/search/${query.trim().toUpperCase()}`);
      if (res.data.found) {
        onResult(res.data);
      } else {
        setError("Stock not found. Try a valid NSE symbol like RELIANCE, TCS, INFY");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search NSE stock symbol e.g. RELIANCE"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </div>
      {error && <div className="error" style={{ marginTop: "1rem" }}>{error}</div>}
    </div>
  );
}

export default SearchBar;

