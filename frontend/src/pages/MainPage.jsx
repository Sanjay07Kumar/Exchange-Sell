import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { clearAuthData, getAuthToken } from "../utils/tokenUtils";
import { Plus, ArrowRight, Tag } from "lucide-react";

export default function MainPage() {
  const [recentItems, setRecentItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);
  const [token, setToken] = useState(() => getAuthToken());

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const categoriesRes = await fetch("http://localhost:8080/categories/all");
        if (cancelled) return;
        setCategories(await categoriesRes.json());

        if (!token) {
          const itemsRes = await fetch("http://localhost:8080/items/all");
          const allItems = await itemsRes.json();
          if (cancelled) return;
          setRecentItems(allItems);
          setShowAllItems(true);
          return;
        }

        try {
          const itemsRes = await fetch("http://localhost:8080/items/others-items", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

          if (itemsRes.ok) {
            const othersItems = await itemsRes.json();
            if (cancelled) return;
            setRecentItems(othersItems);
            setShowAllItems(false);
          } else if (itemsRes.status === 401) {
            clearAuthData();
            setToken(null);
            const fallbackRes = await fetch("http://localhost:8080/items/all");
            const allItems = await fallbackRes.json();
            if (cancelled) return;
            setRecentItems(allItems);
            setShowAllItems(true);
          } else {
            const fallbackRes = await fetch("http://localhost:8080/items/all");
            const allItems = await fallbackRes.json();
            if (cancelled) return;
            setRecentItems(allItems);
            setShowAllItems(true);
          }
        } catch (fetchError) {
          const fallbackRes = await fetch("http://localhost:8080/items/all");
          const allItems = await fallbackRes.json();
          if (cancelled) return;
          setRecentItems(allItems);
          setShowAllItems(true);
        }
      } catch (err) {
        try {
          const fallbackRes = await fetch("http://localhost:8080/items/all");
          const allItems = await fallbackRes.json();
          if (cancelled) return;
          setRecentItems(allItems);
          setShowAllItems(true);
        } catch (finalErr) {
          console.error("Complete failure:", finalErr);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setLoading(true);
    loadData();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    const id = setInterval(() => {
      const current = getAuthToken();
      if (current !== token) setToken(current);
    }, 500);
    function onStorage(e) {
      if (e.key === "Token") setToken(e.newValue);
    }
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(id); window.removeEventListener("storage", onStorage); };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen mt-[64px]">

      {/* ── Categories Strip ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">

          {/* Strip Header */}
          <div className="flex items-center gap-2 mb-4">
            <Tag size={13} className="text-orange-500" />
            <span className="text-[11px] font-bold tracking-[3px] uppercase text-gray-800">
              Browse Categories
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/items/category/${cat.id}`)}
                className="flex flex-col items-center gap-1.5 w-20 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
              >
                <div className="w-16 h-10 flex items-center justify-center">
                  <img
                    src={cat.categoryImg}
                    alt={cat.name}
                    className="w-10 h-10 object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <p className="text-[12px] font-bold text-gray-700 group-hover:text-orange-500 transition-colors text-center leading-tight px-1">
                  {cat.name}
                </p>
                <p className="text-[10px] text-gray-400">{cat.productCount} items</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Items Section ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-bold tracking-[3px] uppercase text-orange-500 mb-1">
              Marketplace
            </p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {showAllItems ? "Recently Posted Items" : "Recently Posted by Others"}
            </h2>
          </div>

          {showAllItems && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600">
              <span>Showing all items —</span>
              <a
                href="/login"
                className="font-bold text-orange-500 hover:underline"
              >
                Login
              </a>
              <span>to personalize</span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <Plus size={28} className="text-orange-500" />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-1">No items yet</p>
            <p className="text-gray-400 text-sm mb-6">
              {showAllItems ? "Be the first to post something!" : "No items posted by others yet."}
            </p>
            <button
              onClick={() => navigate("/addItem")}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-orange-500 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-200 group"
            >
              <Plus size={14} />
              Post an Item
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        ) : (
          /* Items Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/items/${item.id}`)}
                className="bg-white border p-2 border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={
                      item.imageUrls && item.imageUrls.length > 0
                        ? item.imageUrls[0]
                        : "/placeholder.png"
                    }
                    alt={item.title || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs font-black text-orange-500 mt-0.5">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}