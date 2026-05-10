import { Link, useNavigate, useLocation } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { FaBox, FaFacebookMessenger, FaHeart, FaSearch, FaUser } from "react-icons/fa";
import { useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { clearAuthData, getAuthToken } from "../utils/tokenUtils";
import ChatSideBar from "./ChatSideBar";

export default function Navbar() {
  const [showChat, setShowChat] = useState(false);
  const token = getAuthToken();
  const isLoggedIn = !!token;
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="fixed top-0 w-full h-[64px] bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-6xl h-full mx-auto px-6 flex items-center gap-5">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-black italic text-orange-500 tracking-tight flex-shrink-0"
        >
          ExSell
        </Link>

        {/* Search Bar */}
        <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 gap-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <FaSearch
            className="text-gray-400 flex-shrink-0 cursor-pointer hover:text-orange-500 transition-colors"
            size={13}
            onClick={() => navigate(`/search?q=${query}`)}
          />
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-1">

          {/* Cart */}
          <Link
            to="/cart"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200 group"
          >
            <CiShoppingCart size={22} />
            <span className="text-[10px] font-bold tracking-wide uppercase">Cart</span>
          </Link>

          {/* Sell */}
          <Link
            to="/additem"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-orange-500 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 ml-1"
          >
            <Plus size={13} />
            Sell
          </Link>

          {/* Messenger */}
          <button
            onClick={() => setShowChat(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200 hidden md:flex"
          >
            <FaFacebookMessenger size={19} />
            <span className="text-[10px] font-bold tracking-wide uppercase">Chat</span>
          </button>

          {/* User */}
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="ml-1 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-200"
            >
              Login
            </Link>
          ) : (
            <div className="relative group ml-1">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-all duration-200">
                <FaUser size={18} />
                <span className="text-[10px] font-bold tracking-wide uppercase">Account</span>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">

                {/* Dropdown Header */}
                <div className="bg-gray-900 px-4 py-2.5">
                  <p className="text-[10px] font-bold tracking-[2px] uppercase text-orange-400">My Account</p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                >
                  <FaUser size={12} className="text-gray-400" />
                  My Profile
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                >
                  <FaBox size={12} className="text-gray-400" />
                  Orders
                </Link>

                <button
                  onClick={() => {
                    localStorage.setItem("activeTab", "wishlist");
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                >
                  <FaHeart size={12} className="text-gray-400" />
                  Wishlist
                </button>

                <div className="h-px bg-gray-100" />

                <button
                  onClick={() => {
                    clearAuthData();
                    navigate("/");
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={12} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showChat && <ChatSideBar closeChat={() => setShowChat(false)} />}
    </div>
  );
}