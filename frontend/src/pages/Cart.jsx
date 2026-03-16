import { useEffect, useState } from "react";
import Footer from "./Footer";
import { getAuthToken } from "../utils/tokenUtils";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCart() {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
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

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (cartId) => {
    setMessage("");
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:8080/cart/${cartId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (res.ok) {
        setMessage("Removed from cart");
        loadCart();
      } else {
        setMessage(text || "Failed to remove item");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove item");
    }
  };

  const total = items.reduce((acc, ci) => acc + (ci.item.price || 0) * (ci.quantity || 1), 0);

  if (loading) return <p className="text-center mt-20">Loading cart...</p>;

  return (
    <div>
    <div className="max-w-6xl mx-auto mt-28 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {message && <p className="mb-4 text-sm text-red-600">{message}</p>}
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {items.map((ci) => (
              <div key={ci.cartId} className="flex items-center gap-4 bg-white p-4 rounded shadow">
                <img
                  src={ci.item.imageUrls && ci.item.imageUrls.length > 0 ? `http://localhost:8080${ci.item.imageUrls[0]}` : "/placeholder.png"}
                  alt={ci.item.name}
                  className="w-28 h-20 object-contain bg-gray-100 rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{ci.item.name}</h3>
                  <p className="text-sm text-gray-600">₹{ci.item.price}</p>
                  <p className="text-sm">Quantity: {ci.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(ci.item.price * ci.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(ci.cartId)} className="mt-2 text-sm text-red-600">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded">Proceed to Checkout</button>
          </div>
        </div>
      )}

      
    </div>
    <Footer />
  </div>
  );
}
