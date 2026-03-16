import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Search() {
  const query = useQuery();
  const q = query.get("q") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/items/all");
        if (!res.ok) throw new Error("Failed to fetch items");
        const all = await res.json();
        if (cancelled) return;
        const term = q.trim().toLowerCase();
        if (!term) {
          setItems(all);
        } else {
          const filtered = all.filter((it) => {
            const name = (it.name || "").toLowerCase();
            const cat = (it.category || "").toLowerCase();
            const desc = (it.description || "").toLowerCase();
            return name.includes(term) || cat.includes(term) || desc.includes(term);
          });
          setItems(filtered);
        }
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [q]);

  if (loading) return <p className="text-center mt-20">Searching...</p>;

  return (
    <div className="max-w-7xl mx-auto mt-28 px-4">
      <h1 className="text-2xl font-bold mb-4">Search results for "{q}"</h1>
      {items.length === 0 ? (
        <p className="text-gray-600">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.id} className="bg-white p-3 rounded shadow cursor-pointer" onClick={() => navigate(`/items/${it.id}`)}>
              <img
                src={it.imageUrls && it.imageUrls.length > 0 ? `http://localhost:8080${it.imageUrls[0]}` : "/placeholder.png"}
                alt={it.name}
                className="w-full h-44 object-contain bg-gray-100 rounded"
              />
              <h3 className="mt-2 font-semibold">{it.name}</h3>
              <p className="text-green-700">₹{it.price}</p>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
