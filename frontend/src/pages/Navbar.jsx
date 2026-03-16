import { Link, useNavigate, useLocation } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { FaBox, FaFacebookMessenger, FaHeart, FaSearch, FaUser } from "react-icons/fa";

import { useState,useEffect } from "react";
import { LogOut} from "lucide-react";
import { isTokenExpired, clearAuthData } from "../utils/tokenUtils";
import ChatSideBar from "./ChatSideBar";

export default function Navbar() {

  const hasToken = !!localStorage.getItem("Token");
  const [showChat , setShowChat]= useState(false);
  const isLoggedIn = hasToken && !isTokenExpired();
  const location = useLocation();   // <-- correct way
  const navigate = useNavigate();   // <-- to redirect to search results

  // If token exists but is expired, clear it and redirect to login
  useEffect(() => {
    if (hasToken && isTokenExpired()) {
      clearAuthData();
      navigate("/login");
    }
  }, [hasToken, navigate]);

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
    <div className={"fixed top-0 w-full h-[60px] bg-white z-10"}>
      <div className="max-w-6xl h-full mx-auto flex items-center gap-6">

        <Link to="/" className="text-xl text-orange-400 font-bold italic">
          ExSell
        </Link>

        <div className="flex flex-1 bg-gray-200 rounded-md items-center px-4 py-1">
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
            size={15}
            onClick={() => navigate(`/search?q=${query}`)}
          />
        </div>

        <div className="relative cursor-pointer group">
          {!isLoggedIn ?(
            <Link
              to="/login"
              className="bg-orange-400 text-md text-white px-6 py-1 rounded-md font-semibold hover:bg-orange-500"
            >
              Login
            </Link>
          ) : (

          <div>
            <FaUser size={30} className="border p-1 rounded-full"/>
            <div 
            className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
              
              <Link 
                to="/profile"
                className="block flex text-xs gap-5 px-4 py-2 hover:bg-gray-100"
              >
                <FaUser size={15}/> My Profile
              </Link>
              
              <Link 
                to="/orders"
                className="block flex text-xs gap-5 px-4 py-2 hover:bg-gray-100"
              >
                <FaBox size={13}/>Orders
              </Link>

              <button
                onClick={() => {
                  localStorage.setItem("activeTab", "wishlist");
                  navigate("/profile");
                }}
                className="block w-full text-left flex text-xs gap-5 px-4 py-2 hover:bg-gray-100"
              >
                <FaHeart size={15}/>Wishlist
              </button>

              <button 
                onClick={() => {
                  clearAuthData();
                  navigate("/");
                  window.location.reload();
                }}
                className="block w-full flex text-xs gap-5 px-4 py-2 hover:bg-red-500"
              >
                <LogOut size={15}/> Logout
              </button>
            </div>
          </div>

          )}

      </div>
      

        

        <Link
          to="/cart"
          className="flex items-center gap-1 text-sm font-semibold hover:underline"
        >
          <CiShoppingCart size={20} />
          Cart
        </Link>

        <Link
          to="/additem"
          className="flex items-center gap-1 text-sm font-medium hover:underline"
        >
          <CiShoppingCart 
          size={20}
          
           />
          Sell
        </Link>

        <button
          onClick={() => setShowChat(true)}
          className="text-sm font-semibold hover:underline hidden md:block"
        >
          <FaFacebookMessenger size={20}/>
        </button>

      </div>

    {showChat && <ChatSideBar closeChat={() => setShowChat(false)} />}
    </div>
  );
}
