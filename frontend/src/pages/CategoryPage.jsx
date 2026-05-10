import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import { getAuthToken } from "../utils/tokenUtils";
import { ChevronRight } from "lucide-react";

export default function CategoryPage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`http://localhost:8080/items/category/${id}`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch items. Status: ${res.status}`);
        const itemsData = await res.json();
        setItems(itemsData);

        const catRes = await fetch(`http://localhost:8080/categories/${id}`, { headers });
        const catData = await catRes.json();
        setCategory(catData);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen mt-[64px]">

      {/* ── Orange Top Banner ── */}
      <div className="bg-orange-500 w-full">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          {category?.categoryImg && (
            <img src={category.categoryImg} alt={category.name} className="w-10 h-10 object-contain" />
          )}
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{category?.name}</h1>
            <p className="text-orange-100 text-xs mt-0.5">{items.length} items found</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-1 text-orange-100 text-xs font-medium">
            <span>Home</span>
            <ChevronRight size={12} />
            <span className="text-white font-bold">{category?.name}</span>
          </div>
        </div>
      </div>

      {/* ── Items Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        {items.length === 0 ? (
          <div className="bg-white shadow-sm flex flex-col items-center justify-center py-24 gap-3">
            <img src="/no-image.png" alt="" className="w-20 h-20 object-contain opacity-30" />
            <p className="text-gray-500 font-semibold">No items found in this category</p>
            <p className="text-gray-400 text-sm">Check back later or explore other categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => window.location.href = `/items/${item.id}`}
                className="bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 group overflow-hidden"
              >
                {/* Image */}
                <div className="w-full aspect-square bg-white flex items-center justify-center p-3 border-b border-gray-100">
                  <img
                    src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "/no-image.png"}
                    onError={(e) => e.target.src = "/no-image.png"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="px-3 py-2.5">
                  <p className="text-xs text-gray-700 font-medium truncate leading-snug">{item.name}</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-1">₹{item.price}</p>
                  {item.isNegotiable && (
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5">
                      Negotiable
                    </span>
                  )}
                  {/* {item.condition && (
                    <p className="text-[10px] text-gray-400 mt-1">{item.condition}</p>
                  )} */}
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