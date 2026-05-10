import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { getAuthToken } from "../utils/tokenUtils";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCart() {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) { navigate("/login"); return; }
      const res = await fetch("http://localhost:8080/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        setMessage(t || "Failed to load cart");
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCart(); }, []);

  const removeItem = async (cartId) => {
    setMessage("");
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:8080/cart/${cartId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (res.ok) { setMessage("Removed from cart"); loadCart(); }
      else setMessage(text || "Failed to remove item");
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove item");
    }
  };

  const total = items.reduce((acc, ci) => acc + (ci.item.price || 0) * (ci.quantity || 1), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-100 min-h-screen mt-[64px]">

      {/* ── Orange Top Banner ── */}
      <div className="bg-orange-500 w-full">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <ShoppingCart size={22} className="text-white" />
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Your Cart</h1>
            <p className="text-orange-100 text-xs mt-0.5">{items.length} {items.length === 1 ? "item" : "items"}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Message */}
        {message && (
          <div className="mb-4 px-4 py-3 bg-white border border-orange-200 rounded-sm text-sm text-orange-600 font-medium shadow-sm">
            {message}
          </div>
        )}

        {items.length === 0 ? (
          /* Empty State */
          <div className="bg-white shadow-sm flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <ShoppingCart size={28} className="text-orange-400" />
            </div>
            <p className="text-gray-700 font-semibold text-base">Your cart is empty</p>
            <p className="text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 mt-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-sm transition-all duration-200 group"
            >
              Browse Items
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

        ) : (
          <div className="flex flex-col lg:flex-row gap-4 items-start">

            {/* ── Cart Items ── */}
            <div className="flex-1 flex flex-col gap-3">
              {items.map((ci) => (
                <div key={ci.cartId} className="bg-white shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow duration-200">

                  {/* Image */}
                  <div className="w-28 h-24 bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center p-2">
                    <img
                      src={ci.item.imageUrls && ci.item.imageUrls.length > 0 ? ci.item.imageUrls[0] : "/placeholder.png"}
                      alt={ci.item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => navigate(`/items/${ci.item.id}`)}
                      className="text-sm font-semibold text-gray-800 hover:text-orange-500 cursor-pointer truncate transition-colors"
                    >
                      {ci.item.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{ci.item.category}</p>
                    <p className="text-lg font-extrabold text-gray-900 mt-1.5">₹{ci.item.price}</p>
                    {ci.item.isNegotiable && (
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 mt-1 inline-block">
                        Negotiable
                      </span>
                    )}
                  </div>

                  {/* Right: subtotal + remove */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Qty: {ci.quantity}</p>
                      <p className="text-base font-extrabold text-gray-900 mt-0.5">
                        ₹{(ci.item.price * ci.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(ci.cartId)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary ── */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Price Details</p>
                </div>
                <div className="px-4 py-4 flex flex-col gap-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Price ({items.length} {items.length === 1 ? "item" : "items"})</span>
                    <span className="font-medium text-gray-800">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="flex justify-between">
                    <span className="text-sm font-extrabold text-gray-800">Total Amount</span>
                    <span className="text-base font-extrabold text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 group">
                    Proceed to Checkout
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}