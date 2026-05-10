import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { FaHeart } from "react-icons/fa";
import { getAuthToken } from "../utils/tokenUtils";
import { MessageCircle, ArrowRight, RefreshCw, CheckCircle, XCircle, ChevronRight } from "lucide-react";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [sameCategoryItems, setSameCategoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistEntryId, setWishlistEntryId] = useState(null);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [marking, setMarking] = useState(false);

  const startChat = async () => {
    const token = getAuthToken();
    if (!token) { window.location.href = "/login"; return; }
    try {
      const res = await fetch(`http://localhost:8080/chat/rooms/item/${item.id}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to start chat");
      const data = await res.json();
      navigate(`/chat/room/${data.roomId}`);
    } catch (err) { console.error(err); alert("Could not start chat"); }
  };

  const handleMarkAsSoldOut = async () => {
    const token = getAuthToken();
    if (!token) { window.location.href = "/login"; return; }
    setMarking(true);
    try {
      const endpoint = isSoldOut
        ? `http://localhost:8080/items/mark-active/${item.id}`
        : `http://localhost:8080/items/mark-sold/${item.id}`;
      const res = await fetch(endpoint, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to update item status");
      const message = await res.text();
      console.log(message);
      setIsSoldOut(!isSoldOut);
      setItem({ ...item, status: !isSoldOut ? "SOLD_OUT" : "ACTIVE" });
    } catch (err) { console.error(err); alert("Could not update item status"); }
    finally { setMarking(false); }
  };

  const handleChatWithSeller = useCallback(() => startChat(), [navigate, item?.id]);
  const handleNegotiate = useCallback(() => startChat(), [navigate, item?.id]);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/items/${id}`);
        if (!res.ok) throw new Error("Failed to load item");
        const data = await res.json();
        setItem(data); setSelectedImage(0); setIsSoldOut(data.status === "SOLD_OUT");

        if (data.category) {
          const simRes = await fetch(`http://localhost:8080/items/category/name/${data.category}`);
          if (simRes.ok) {
            const simData = await simRes.json();
            setSameCategoryItems(simData.filter((i) => i.id !== data.id && i.status !== "SOLD_OUT"));
          }
        }

        const UserId = localStorage.getItem("UserId");
        if (UserId) {
          const token = getAuthToken();
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const wlRes = await fetch(`http://localhost:8080/wishlist/user/${UserId}`, { headers });
          if (wlRes.ok) {
            const wlData = await wlRes.json();
            const entry = wlData.find((w) => w.item.id === data.id);
            if (entry) { setIsWishlisted(true); setWishlistEntryId(entry.id); }
            else { setIsWishlisted(false); setWishlistEntryId(null); }
          }
        }
      } catch (err) { console.error("Error:", err); }
      finally { setLoading(false); }
    }
    loadItem();
  }, [id]);

  const toggleWishlist = async () => {
    try {
      const token = getAuthToken();
      const UserId = localStorage.getItem("UserId");
      if (!UserId || !item || !token) { navigate("/login"); return; }
      if (!isWishlisted) {
        const res = await fetch("http://localhost:8080/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: UserId, itemId: item.id }),
        });
        if (!res.ok) throw new Error("Failed to add to wishlist");
        const saved = await res.json();
        setIsWishlisted(true); setWishlistEntryId(saved.id);
      } else {
        if (!wishlistEntryId) return;
        const res = await fetch(`http://localhost:8080/wishlist/${wishlistEntryId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to remove from wishlist");
        setIsWishlisted(false); setWishlistEntryId(null);
      }
    } catch (err) { console.error(err); }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );

  if (!item)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-base">Item not found.</p>
      </div>
    );

  const currentUserId = localStorage.getItem("UserId");
  const isOwner = currentUserId && item.userId && String(currentUserId) === String(item.userId);

  const specs = [
    { label: "Condition", value: item.condition },
    { label: "Item Age", value: item.itemAge },
    { label: "Negotiable", value: item.isNegotiable ? "Yes" : "No" },
    { label: "Available", value: item.isAvailable ? "Yes" : "No" },
    { label: "For Exchange", value: item.forExchange ? "Yes" : "No" },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen mt-[64px]">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-1.5 text-xs text-gray-400">
          <span className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => navigate("/")}>Home</span>
          <ChevronRight size={12} />
          <span className="hover:text-orange-500 cursor-pointer transition-colors" onClick={() => navigate(`/items/category/${item.categoryId}`)}>{item.category}</span>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{item.name}</span>
        </div>
      </div>

      {/* ── Main Detail Section ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Images ── */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

            <div className="p-4 flex gap-3 items-start">
              {/* Thumbnails */}
              {item.imageUrls && item.imageUrls.length > 1 && (
                <div className="flex flex-col gap-2">
                  {item.imageUrls.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedImage === index
                          ? "border-orange-400 shadow-sm shadow-orange-100"
                          : "border-gray-100 hover:border-orange-200"
                      }`}
                    >
                      <img src={img} className="w-full h-full object-contain" alt="" />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 relative bg-orange-50/30 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
                <button
                  onClick={toggleWishlist}
                  className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
                    isWishlisted ? "bg-red-500" : "bg-white border border-gray-100 hover:border-red-200"
                  }`}
                >
                  <FaHeart className={`text-sm ${isWishlisted ? "text-white" : "text-gray-300"}`} />
                </button>

                {isSoldOut && (
                  <div className="absolute top-3 left-3 z-10 bg-gray-500 text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
                    Sold Out
                  </div>
                )}

                <img
                  src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[selectedImage] : "/placeholder.png"}
                  alt={item.name}
                  onError={(e) => console.log("IMAGE FAILED:", e.target.src)}
                  className="w-full h-full object-contain p-5"
                />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="px-4 pb-5">
              <div className="h-px bg-gray-50 mb-4" />

              <p className="text-[10px] font-semibold tracking-[2px] uppercase text-gray-400 mb-3">
                {isOwner ? "Manage Listing" : "Interested?"}
              </p>

              {isOwner ? (
                <div className="flex flex-col gap-2">
                  {isSoldOut && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <XCircle size={14} className="text-gray-400" />
                      <p className="text-sm text-gray-500">Currently Sold Out</p>
                    </div>
                  )}
                  {!isSoldOut && <p className="text-xs text-gray-400 mb-1">This is your listing</p>}
                  <button
                    onClick={handleMarkAsSoldOut}
                    disabled={marking}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 ${
                      isSoldOut
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "border border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500"
                    }`}
                  >
                    <RefreshCw size={14} className={marking ? "animate-spin" : ""} />
                    {marking ? "Updating..." : isSoldOut ? "Mark as Available" : "Mark as Sold Out"}
                  </button>
                </div>
              ) : isSoldOut ? (
                <div className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <XCircle size={15} className="text-gray-400" />
                  <p className="text-sm text-gray-500">This item is Sold Out</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleChatWithSeller}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm shadow-orange-100"
                  >
                    <MessageCircle size={15} />
                    Chat with Seller
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                  {item.isNegotiable && (
                    <button
                      onClick={handleNegotiate}
                      className="w-full py-3 border border-orange-300 text-orange-500 hover:bg-orange-50 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      Negotiate Price
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Item Details ── */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

            <div className="p-6 flex flex-col gap-5">

              {/* Name + Status */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs text-orange-500 font-medium">{item.category}</span>
                  <h1 className="text-2xl font-bold text-gray-800 mt-1 leading-snug">{item.name}</h1>
                </div>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  isSoldOut ? "bg-gray-100 text-gray-400" : "bg-orange-50 text-orange-500 border border-orange-100"
                }`}>
                  {isSoldOut ? <XCircle size={11} /> : <CheckCircle size={11} />}
                  {isSoldOut ? "Sold Out" : "Available"}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pb-1">
                <span className="text-lg text-gray-400 font-medium">₹</span>
                <span className="text-4xl font-bold text-gray-800">{item.price}</span>
              </div>

              <div className="h-px bg-gray-50" />

              {/* Description */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="h-px bg-gray-50" />

              {/* Specs */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Specifications</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map((spec) => (
                    <div key={spec.label} className="bg-orange-50/50 border border-orange-100/80 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-orange-300 mb-0.5">{spec.label}</p>
                      <p className="text-sm font-semibold text-gray-700">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Items ── */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="mb-5">
          <p className="text-xs text-orange-500 font-medium mb-1">Explore More</p>
          <h2 className="text-xl font-bold text-gray-700">More in {item.category}</h2>
        </div>

        {sameCategoryItems.length === 0 ? (
          <p className="text-gray-400 text-sm">No other items found in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sameCategoryItems.map((prod) => (
              <Link
                key={prod.id}
                to={`/items/${prod.id}`}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="aspect-square bg-orange-50/20 overflow-hidden">
                  <img
                    src={prod.imageUrls && prod.imageUrls.length > 0 ? prod.imageUrls[0] : "/placeholder.png"}
                    alt={prod.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                  />
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-700 truncate">{prod.name}</p>
                  <p className="text-sm font-bold text-orange-500 mt-0.5">₹{prod.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}