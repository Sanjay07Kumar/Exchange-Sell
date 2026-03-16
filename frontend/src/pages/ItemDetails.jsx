import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "./Footer";
import { FaHeart } from "react-icons/fa";
import { getAuthToken } from "../utils/tokenUtils";

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [sameCategoryItems, setSameCategoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistEntryId, setWishlistEntryId] = useState(null); // store id of wishlist record

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        // Load main item
        const res = await fetch(`http://localhost:8080/items/${id}`);
        if (!res.ok) throw new Error("Failed to load item");
        const data = await res.json();
        setItem(data);
        setSelectedImage(0);

        // Load same-category items
        if (data.category) {
          const simRes = await fetch(
            `http://localhost:8080/items/category/name/${data.category}`
          );
          if (simRes.ok) {
            const simData = await simRes.json();
            const filtered = simData.filter((i) => i.id !== data.id);
            setSameCategoryItems(filtered);
          }
        }

        // Check if item is in wishlist
        const UserId = localStorage.getItem("UserId");
        if (UserId) {
          const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const wlRes = await fetch(`http://localhost:8080/wishlist/user/${UserId}`, { headers });
        if (wlRes.ok) {
            const wlData = await wlRes.json();
            const entry = wlData.find((w) => w.item.id === data.id);
            if (entry) {
              setIsWishlisted(true);
              setWishlistEntryId(entry.id);
            } else {
              setIsWishlisted(false);
              setWishlistEntryId(null);
            }
          }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  const toggleWishlist = async () => {
    try {
      const token = getAuthToken();
      const UserId = localStorage.getItem("UserId");
      if (!UserId || !item || !token) return;

      if (!isWishlisted) {
        // Add to wishlist using the POST /wishlist endpoint
        const res = await fetch("http://localhost:8080/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: UserId, itemId: item.id }),
        });
        if (!res.ok) throw new Error("Failed to add to wishlist");
        const saved = await res.json();
        setIsWishlisted(true);
        setWishlistEntryId(saved.id);
      } else {
        // Remove from wishlist using the record id
        if (!wishlistEntryId) return;
        const res = await fetch(`http://localhost:8080/wishlist/${wishlistEntryId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to remove from wishlist");
        setIsWishlisted(false);
        setWishlistEntryId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-24 text-xl font-semibold">Loading...</p>
    );

  if (!item)
    return (
      <p className="text-center mt-24 text-xl font-semibold">Item not found</p>
    );

  return (
    <div>
      <div className="max-w-6xl mx-auto mt-[70px] px-4">
        {/* ==================== ITEM DETAILS ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT IMAGE */}
          <div className="bg-white border border-gray-200">
            <div className="flex gap-4 p-3 items-start relative">
              {item.imageUrls && item.imageUrls.length > 1 && (
                <div className="flex flex-col gap-3">
                  {item.imageUrls.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8080${img}`}
                      onClick={() => setSelectedImage(index)}
                      className={`w-12 h-12 border object-contain cursor-pointer transition-transform duration-200 ${
                        selectedImage === index
                          ? "border-blue-600 scale-105"
                          : "border-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
              <div className="flex-1 flex items-center justify-center bg-gray-50 shadow-md relative">
                {/* Heart Icon */}
                <FaHeart
                  onClick={toggleWishlist}
                  className={`absolute top-2 right-2 w-6 h-6 cursor-pointer transition-colors ${
                    isWishlisted ? "text-red-600" : "text-gray-200"
                  }`}
                />
                <img
                  src={
                    item.imageUrls && item.imageUrls.length > 0
                      ? `http://localhost:8080${item.imageUrls[selectedImage]}`
                      : "/placeholder.png"
                  }
                  alt={item.name}
                  className="max-w-full max-h-60 object-contain"
                />
              </div>
            </div>

            {/* CONTACT SELLER */}
            <div className="p-5">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Interested in this item?
              </h3>
              <div className="flex gap-4">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-md font-semibold hover:bg-blue-700">
                  Chat with Seller
                </button>
                {item.isNegotiable && (
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg text-md font-semibold hover:bg-green-700">
                    Negotiate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="col-span-2 bg-white p-8 border border-gray-200 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
              <span className="inline-block mt-3 bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
                {item.category}
              </span>
              <p className="text-gray-600 text-sm font-semibold mt-3">{item.description}</p>
              <p className="text-3xl font-bold text-green-700 mt-4">₹{item.price}</p>

              {/* SPECIFICATIONS */}
              <div className="mt-6 space-y-2 text-gray-800 text-[15px]">
                <p>
                  <span className="font-semibold">Condition:</span> {item.condition}
                </p>
                <p>
                  <span className="font-semibold">Item Age:</span> {item.itemAge}
                </p>
                <p>
                  <span className="font-semibold">Negotiable:</span>{" "}
                  {item.isNegotiable ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-semibold">Available:</span>{" "}
                  {item.isAvailable ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-semibold">For Exchange:</span>{" "}
                  {item.forExchange ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto mt-10 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          More Items in {item.category}
        </h2>
        {sameCategoryItems.length === 0 ? (
          <p className="text-gray-600">No other items found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {sameCategoryItems.map((prod) => (
              <Link
                key={prod.id}
                to={`/items/${prod.id}`}
                className="bg-white border border-gray-200 shadow-md p-3 hover:shadow-xl transition"
              >
                <img
                  src={
                    prod.imageUrls && prod.imageUrls.length > 0
                      ? `http://localhost:8080${prod.imageUrls[0]}`
                      : "/placeholder.png"
                  }
                  alt={prod.name}
                  className="w-full h-20 md:h-40 lg:h-40 object-contain"
                />
                <h3 className="mt-3 text-sm font-bold text-gray-800">{prod.name}</h3>
                <p className="text-green-700 text-xs font-semibold mt-1">₹{prod.price}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}