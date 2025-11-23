import { Link, useNavigate, useLocation } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";

import { useState } from "react";

export default function Navbar() {

  const isLoggedIn= !!localStorage.getItem("token");
  const location = useLocation();   // <-- correct way
  const navigate = useNavigate();   // <-- to redirect to search results

  const [query, setQuery] = useState("");
  
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${query}`);
    }
  };

  return (
    <div className="fixed top-0 w-full h-[70px] bg-white shadow-md">
      <div className="max-w-7xl h-full mx-auto flex items-center gap-6">

        <Link to="/" className="text-2xl text-orange-400 font-bold italic">
          ExSell
        </Link>

        <div className="flex flex-1 bg-gray-200 rounded-md items-center px-4 py-2">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            className="flex-1 outline-none bg-transparent text-black text-md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <FaSearch 
            className="text-black opacity-60 cursor-pointer"
            size={20}
            onClick={() => navigate(`/search?q=${query}`)}
          />
        </div>

      {!isLoggedIn && (
        <Link
          to="/login"
          className="bg-white text-black px-6 py-1 rounded-md font-semibold hover:bg-gray-100"
        >
          Login
        </Link>
      )}

        <Link className="text-black font-semibold hover:underline hidden md:block">
          Become a Seller
        </Link>

        <Link
          to="/cart"
          className="flex items-center gap-1 text-black font-medium hover:underline"
        >
          <CiShoppingCart size={24} />
          Cart
        </Link>

        <Link
          to="/sell"
          className="flex items-center gap-1 text-black font-medium hover:underline"
        >
          <CiShoppingCart size={24} />
          Sell
        </Link>

      </div>
    </div>
  );
}
