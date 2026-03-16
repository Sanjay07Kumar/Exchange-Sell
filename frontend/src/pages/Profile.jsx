import { useEffect, useState } from "react";
import UserPic from "../assets/placeholder.jpg";
import Footer from "./Footer";
import { FaBox, FaFolder, FaPowerOff, FaUser, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAuthToken, isTokenExpired } from "../utils/tokenUtils";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") || "account");

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const [userItems, setUserItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");

  // Wishlist
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const UserId = localStorage.getItem("UserId");
  const isLoggedIn = !!localStorage.getItem("Token") && !isTokenExpired();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuthToken();
        if (!UserId?.trim()) {
          setError("Missing UserId. Please login again.");
          return;
        }
        const response = await fetch(`http://localhost:8080/user/profile/${UserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          setError("Failed to load profile");
          return;
        }

        const data = await response.json();
        setEmail(data.email || "");
        setUsername(data.username || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setState(data.state || "");
        setProfilePhotoUrl(data.profilePhotoUrl || "");
      } catch (err) {
        setError("Error fetching profile");
      }
    };

    fetchUser();
  }, [UserId]);

  // Fetch user's items
  useEffect(() => {
    if (activeTab !== "myitems") return;

    const fetchItems = async () => {
      setItemsLoading(true);
      setItemsError("");
      try {
        const token = localStorage.getItem("Token");
        const res = await fetch(`http://localhost:8080/items/my-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const txt = await res.text();
          setItemsError(txt || "Failed to fetch items");
          setUserItems([]);
          return;
        }

        const data = await res.json();
        setUserItems(data || []);
      } catch (err) {
        setItemsError("Error fetching items");
        setUserItems([]);
      } finally {
        setItemsLoading(false);
      }
    };

    fetchItems();
  }, [activeTab, UserId]);

  // Fetch wishlist
  useEffect(() => {
    if (activeTab !== "wishlist") return;

    const fetchWishlist = async () => {
      setWishlistLoading(true);
      setWishlistError("");
      try {
        const token = getAuthToken();
        if (!token) {
          // nothing we can do, token expired or missing
          setWishlistError("Authentication required");
          setWishlist([]);
          return;
        }
        const res = await fetch(`http://localhost:8080/wishlist/user/${UserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const data = await res.json();
        setWishlist(data);
      } catch (err) {
        setWishlistError(err.message);
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [activeTab, UserId]);

  const removeFromWishlist = async (wishlistId) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`http://localhost:8080/wishlist/${wishlistId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove item");
      setWishlist((prev) => prev.filter((w) => w.id !== wishlistId));
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (!phone.trim()) return "Phone number is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch("http://localhost:8080/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: UserId, email, username, phone, city, state, profilePhotoUrl }),
      });

      if (!response.ok) {
        const msg = await response.text();
        setError(msg || "Update failed");
        return;
      }

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(`http://localhost:8080/user/delete/${UserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const message = await response.text();
      if (!response.ok) {
        setError(message || "Failed to delete account");
        return;
      }

      alert("Your account has been deleted.");
      localStorage.removeItem("Token");
      localStorage.removeItem("UserId");
      navigate("/signup");
    } catch (err) {
      setError("Error deleting account. Try again.");
    }
  };

  const renderMyItems = () => {
    if (itemsLoading) return <p>Loading items...</p>;
    if (itemsError) return <p className="text-red-500">{itemsError}</p>;
    if (!userItems || userItems.length === 0) return <p className="text-gray-600">You have not posted any items.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userItems.map((it) => (
          <div
            key={it.id}
            onClick={() => navigate(`/items/${it.id}`)}
            className="border cursor-pointer rounded p-3 bg-white shadow-sm"
          >
            <img
              src={it.imageUrls && it.imageUrls[0] ? `http://localhost:8080${it.imageUrls[0]}` : UserPic}
              alt={it.name}
              className="w-full h-36 object-cover rounded"
            />
            <h3 className="font-semibold mt-2">{it.name}</h3>
            <p className="text-sm text-gray-600 mt-2">{it.description}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold">₹{it.price}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWishlist = () => {
    if (wishlistLoading) return <p>Loading wishlist...</p>;
    if (wishlistError) return <p className="text-red-500">{wishlistError}</p>;
    if (!wishlist || wishlist.length === 0) return <p className="text-gray-600">Your wishlist is empty.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((w) => (
          <div
            key={w.id}
            className="border rounded p-3 bg-white shadow-sm relative"
          >
            {/* heart icon in top right to remove */}
            <FaHeart
              onClick={() => removeFromWishlist(w.id)}
              className="absolute top-2 right-2 text-red-600 cursor-pointer hover:text-red-700"
              size={20}
            />
            <div onClick={() => navigate(`/items/${w.item.id}`)} className="cursor-pointer">
              <img
                src={w.item.imageUrls && w.item.imageUrls[0] ? `http://localhost:8080${w.item.imageUrls[0]}` : UserPic}
                alt={w.item.name}
                className="w-full h-36 object-contain rounded mb-2"
              />
              <h3 className="font-semibold">{w.item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{w.item.description}</p>
              <span className="font-bold text-green-700 mt-1">₹{w.item.price}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto mt-20 flex gap-6 p-6">
        {/* LEFT SIDEBAR */}
        <div className="flex flex-col gap-4">
          <div className="w-80 flex gap-5 bg-white border shadow-sm p-3 rounded-md">
            <img
              src={profilePhotoUrl || UserPic}
              className="w-14 h-14 rounded-full object-cover"
              alt="Profile"
            />
            <div>
              <p className="text-sm text-gray-500">Hello,</p>
              <p className="text-xl font-semibold">{username || "User"}</p>
            </div>
          </div>

          <div className="w-80 bg-white border shadow-sm p-3 rounded-md">
            <div
              className={`mb-2 flex gap-2 items-center cursor-pointer p-2 rounded-md ${
                activeTab === "account" ? "bg-gray-100 text-orange-400" : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("account")}
            >
              <FaUser className="text-orange-400 text-lg" />
              <span className="font-bold">ACCOUNT INFORMATION</span>
            </div>

            <div className="flex items-start gap-3 p-2">
              <FaFolder className="text-orange-400 text-lg mt-1" />
              <div className="flex flex-col gap-2">
                <span className="font-bold ">MY STUFF</span>
                <span
                  className={`text-sm text-gray-700 hover:bg-gray-100 cursor-pointer p-1 rounded ${
                    activeTab === "wishlist" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setActiveTab("wishlist")}
                >
                  Wishlist
                </span>
                <span
                  className={`text-sm text-gray-700 hover:bg-gray-100 cursor-pointer p-1 rounded ${
                    activeTab === "myitems" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setActiveTab("myitems")}
                >
                  My Items
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md">
              <FaPowerOff className="text-orange-400 text-lg" />
              <button
                className="font-bold text-left"
                onClick={() => {
                  localStorage.removeItem("Token");
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-white border shadow-sm p-8 rounded-md min-h-[400px]">
          {activeTab === "account" && (
            <>
              <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {success && <p className="text-green-500 mb-4">{success}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Photo URL</label>
                  <input
                    type="text"
                    value={profilePhotoUrl}
                    onChange={(e) => setProfilePhotoUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </>
          )}

          {activeTab === "myitems" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">My Items</h2>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => navigate("/additem")}
                >
                  Add New Item
                </button>
              </div>
              {renderMyItems()}
            </>
          )}

          {activeTab === "wishlist" && (
            <>
              <h2 className="text-2xl font-semibold mb-4">My Wishlist</h2>
              {renderWishlist()}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}