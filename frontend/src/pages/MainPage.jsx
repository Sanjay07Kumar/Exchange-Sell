import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { getAuthToken } from "../utils/tokenUtils";

export default function MainPage() {
  const [recentItems, setRecentItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false); // Track if showing all items
  const [token, setToken] = useState(() => getAuthToken());

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        // Always fetch categories
        const categoriesRes = await fetch("http://localhost:8080/categories/all");
        if (cancelled) return;
        setCategories(await categoriesRes.json());

        // If no token, show ALL items
        if (!token) {
          console.log("No token found, showing ALL items");
          const itemsRes = await fetch("http://localhost:8080/items/all");
          const allItems = await itemsRes.json();
          if (cancelled) return;
          setRecentItems(allItems);
          setShowAllItems(true); // Mark that we're showing all items
          return;
        }

        // Try to fetch "others-items" with token
        try {
          const itemsRes = await fetch("http://localhost:8080/items/others-items", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            }
          });

          if (itemsRes.ok) {
            const othersItems = await itemsRes.json();
            if (cancelled) return;
            setRecentItems(othersItems);
            setShowAllItems(false); // Showing only others' items
            console.log(`Showing ${othersItems.length} items from others`);
          } else if (itemsRes.status === 401) {
            // Token is invalid/expired
            console.log("Token invalid/expired, clearing and showing ALL items");
            localStorage.removeItem("Token");
            sessionStorage.removeItem("Token");
            setToken(null);
            // Fetch all items
            const fallbackRes = await fetch("http://localhost:8080/items/all");
            const allItems = await fallbackRes.json();
            if (cancelled) return;
            setRecentItems(allItems);
            setShowAllItems(true); // Showing all items
          } else {
            // Other error, fallback to all items
            console.log("Other error, falling back to ALL items");
            const fallbackRes = await fetch("http://localhost:8080/items/all");
            const allItems = await fallbackRes.json();
            if (cancelled) return;
            setRecentItems(allItems);
            setShowAllItems(true);
          }
        } catch (fetchError) {
          console.error("Error fetching others-items:", fetchError);
          // Fallback to all items
          const fallbackRes = await fetch("http://localhost:8080/items/all");
          const allItems = await fallbackRes.json();
          if (cancelled) return;
          setRecentItems(allItems);
          setShowAllItems(true);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        // Last resort: try to get all items
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

  // Poll for token changes (covers login/logout in same tab)
  useEffect(() => {
    const id = setInterval(() => {
      const current = localStorage.getItem("Token") || sessionStorage.getItem("Token");
      if ((current || null) !== token) {
        setToken(current);
      }
    }, 500);
    // Also update token if storage changes from other tabs
    function onStorage(e) {
      if (e.key === 'Token') setToken(e.newValue);
    }
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(id); window.removeEventListener('storage', onStorage); };
  }, [token]);

  if (loading) {
    return (
      <p className="text-center mt-20 text-xl font-semibold">
        Loading...
      </p>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <div className="w-[95%] mt-[70px] mx-auto bg-white p-5 shadow-md">
        <div className="flex flex-wrap justify-center gap-10">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/items/category/${cat.id}`)}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={cat.categoryImg}
                alt={cat.name}
                className="w-14 h-14 object-contain"
              />
              <p className="text-xs font-semibold">{cat.name}</p>
              <p className="text-xs text-gray-700">{cat.productCount} products</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-8xl mx-auto mt-10 px-4">
        {/* Dynamic heading based on what we're showing */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {showAllItems ? "Recently Posted Items" : "Recently Posted by Others"}
          </h2>
          
          {showAllItems && (
            <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded">
              Showing all items - <a href="/login" className="underline">Login</a> to see only others' items
            </div>
          )}
        </div>
        
        {recentItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              {showAllItems ? "No items posted yet." : "No items posted by others yet."}
            </p>
            <button 
              onClick={() => navigate("/add-items")}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Be the first to post!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="shadow p-3 overflow-hidden hover:scale-105 transition-transform cursor-pointer bg-white"
              >
                <img
                  src={
                    item.imageUrls && item.imageUrls.length > 0
                      ? `http://localhost:8080${item.imageUrls[0]}`
                      : "/placeholder.png"
                  }
                  onClick={() => navigate(`/items/${item.id}`)}
                  alt={item.title || item.name}
                  className="w-full h-20 md:h-40 lg:h-40 object-contain"
                />
                <div className="p-2">
                  <p className="font-semibold text-center text-sm truncate">{item.name}</p>
                  <p className="text-gray-600 text-center text-sm">₹{item.price}</p>
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