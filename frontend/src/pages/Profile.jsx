import { useEffect, useState } from "react";
import UserPic from "../assets/placeholder.jpg";
import Footer from "./Footer";
import { FaBox, FaFolder, FaPowerOff, FaUser, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { clearAuthData, getAuthToken, isTokenExpired } from "../utils/tokenUtils";
import { Plus, ArrowRight, Package, ShoppingBag } from "lucide-react";

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

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const [soldItems, setSoldItems] = useState([]);
  const [soldItemsLoading, setSoldItemsLoading] = useState(false);
  const [soldItemsError, setSoldItemsError] = useState("");

  const UserId = localStorage.getItem("UserId");
  const isLoggedIn = !!getAuthToken() && !isTokenExpired();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuthToken();
        if (!UserId?.trim() || !token) { setError("Missing or expired token. Please login again."); return; }
        const response = await fetch(`http://localhost:8080/user/profile/${UserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) { setError("Failed to load profile"); return; }
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

  useEffect(() => {
    if (activeTab !== "myitems") return;
    const fetchItems = async () => {
      setItemsLoading(true); setItemsError("");
      try {
        const token = getAuthToken();
        if (!token) { setItemsError("Authentication required"); setItemsLoading(false); return; }
        const res = await fetch(`http://localhost:8080/items/my-items`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { const txt = await res.text(); setItemsError(txt || "Failed to fetch items"); setUserItems([]); return; }
        setUserItems(await res.json() || []);
      } catch (err) { setItemsError("Error fetching items"); setUserItems([]); }
      finally { setItemsLoading(false); }
    };
    fetchItems();
  }, [activeTab, UserId]);

  useEffect(() => {
    if (activeTab !== "wishlist") return;
    const fetchWishlist = async () => {
      setWishlistLoading(true); setWishlistError("");
      try {
        const token = getAuthToken();
        if (!token) { setWishlistError("Authentication required"); setWishlist([]); return; }
        const res = await fetch(`http://localhost:8080/wishlist/user/${UserId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        setWishlist(await res.json());
      } catch (err) { setWishlistError(err.message); }
      finally { setWishlistLoading(false); }
    };
    fetchWishlist();
  }, [activeTab, UserId]);

  useEffect(() => {
    if (activeTab !== "solditems") return;
    const fetchSoldItems = async () => {
      setSoldItemsLoading(true); setSoldItemsError("");
      try {
        const token = getAuthToken();
        if (!token) { setSoldItemsError("Authentication required"); setSoldItems([]); return; }
        const res = await fetch(`http://localhost:8080/items/my-sold-items`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { const txt = await res.text(); setSoldItemsError(txt || "Failed to fetch sold items"); setSoldItems([]); return; }
        setSoldItems(await res.json() || []);
      } catch (err) { setSoldItemsError("Error fetching sold items"); setSoldItems([]); }
      finally { setSoldItemsLoading(false); }
    };
    fetchSoldItems();
  }, [activeTab, UserId]);

  const removeFromWishlist = async (wishlistId) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`http://localhost:8080/wishlist/${wishlistId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to remove item");
      setWishlist((prev) => prev.filter((w) => w.id !== wishlistId));
    } catch (err) { console.error(err); }
  };

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (!phone.trim()) return "Phone number is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) { setError("Authentication required"); return; }
      const response = await fetch("http://localhost:8080/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: UserId, email, username, phone, city, state, profilePhotoUrl }),
      });
      if (!response.ok) { const msg = await response.text(); setError(msg || "Update failed"); return; }
      setSuccess("Profile updated successfully!");
    } catch (err) { setError("Failed to update. Try again."); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      const token = getAuthToken();
      if (!token) { setError("Authentication required"); return; }
      const response = await fetch(`http://localhost:8080/user/delete/${UserId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const message = await response.text();
      if (!response.ok) { setError(message || "Failed to delete account"); return; }
      alert("Your account has been deleted.");
      clearAuthData();
      navigate("/signup");
    } catch (err) { setError("Error deleting account. Try again."); }
  };

  // ── Spinner helper ──
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Loading...</p>
    </div>
  );

  // ── Empty helper ──
  const Empty = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center">
        <Icon size={24} className="text-orange-400" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );

  const renderMyItems = () => {
    if (itemsLoading) return <Spinner />;
    if (itemsError) return <p className="text-sm text-red-500 font-medium">{itemsError}</p>;
    if (!userItems || userItems.length === 0) return <Empty icon={Package} message="You haven't posted any items yet." />;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userItems.map((it) => (
          <div key={it.id} onClick={() => navigate(`/items/${it.id}`)}
            className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="aspect-video bg-white overflow-hidden">
              <img src={it.imageUrls && it.imageUrls[0] ? it.imageUrls[0] : UserPic} alt={it.name}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="px-3 py-3">
              <p className="text-sm font-bold text-gray-900 truncate">{it.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{it.description}</p>
              <p className="text-sm font-black text-orange-500 mt-2">₹{it.price}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWishlist = () => {
    if (wishlistLoading) return <Spinner />;
    if (wishlistError) return <p className="text-sm text-red-500 font-medium">{wishlistError}</p>;
    if (!wishlist || wishlist.length === 0) return <Empty icon={FaHeart} message="Your wishlist is empty." />;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((w) => (
          <div key={w.id} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative">
            <button onClick={() => removeFromWishlist(w.id)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-red-50 hover:border-red-300 transition-all duration-200">
              <FaHeart className="text-red-500 text-xs" />
            </button>
            <div onClick={() => navigate(`/items/${w.item.id}`)} className="cursor-pointer">
              <div className="aspect-video bg-white overflow-hidden">
                <img src={w.item.imageUrls && w.item.imageUrls[0] ? w.item.imageUrls[0] : UserPic} alt={w.item.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="px-3 py-3">
                <p className="text-sm font-bold text-gray-900 truncate">{w.item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{w.item.description}</p>
                <p className="text-sm font-black text-orange-500 mt-2">₹{w.item.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSoldItems = () => {
    if (soldItemsLoading) return <Spinner />;
    if (soldItemsError) return <p className="text-sm text-red-500 font-medium">{soldItemsError}</p>;
    if (!soldItems || soldItems.length === 0) return <Empty icon={ShoppingBag} message="You have no sold items yet." />;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {soldItems.map((it) => (
          <div key={it.id} onClick={() => navigate(`/items/${it.id}`)}
            className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative">
            <span className="absolute top-3 left-3 z-10 bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
              Sold Out
            </span>
            <div className="aspect-video bg-white overflow-hidden">
              <img src={it.imageUrls && it.imageUrls[0] ? it.imageUrls[0] : UserPic} alt={it.name}
                className="w-full h-full object-contain p-2 opacity-70 group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="px-3 py-3">
              <p className="text-sm font-bold text-gray-900 truncate">{it.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{it.description}</p>
              <p className="text-sm font-black text-orange-500 mt-2">₹{it.price}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { key: "account", label: "Account Info", icon: FaUser },
    { key: "wishlist", label: "Wishlist", icon: FaHeart },
    { key: "myitems", label: "My Items", icon: FaBox },
    { key: "solditems", label: "Sold Items", icon: FaFolder },
  ];

  const tabTitles = {
    account: "Account Information",
    wishlist: "My Wishlist",
    myitems: "My Items",
    solditems: "Sold Items",
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen mt-[64px]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">

          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-white px-5 py-5 flex items-center gap-4 border-b border-gray-100">
              <img src={profilePhotoUrl || UserPic} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" alt="Profile" />
              <div>
                <p className="text-gray-400 text-xs font-medium">Hello,</p>
                <p className="text-gray-900 text-base font-semibold truncate max-w-[130px]">{username || "User"}</p>
              </div>
            </div>
          </div>

          {/* Nav Card */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-white px-5 py-3.5 border-b border-gray-100">
              <p className="text-xs font-semibold text-orange-500">Profile</p>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    activeTab === key
                      ? "bg-orange-50 text-orange-500 border border-orange-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-orange-500"
                  }`}>
                  <Icon size={14} className={activeTab === key ? "text-orange-500" : "text-gray-400"} />
                  {label}
                  {activeTab === key && <ArrowRight size={13} className="ml-auto text-orange-400" />}
                </button>
              ))}

              <div className="h-px bg-gray-100 my-1" />

              <button
                onClick={() => { localStorage.removeItem("Token"); navigate("/login"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <FaPowerOff size={13} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm min-h-[500px]">

          {/* Panel Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">
              {tabTitles[activeTab]}
            </span>
            {activeTab === "myitems" && (
              <button onClick={() => navigate("/additem")}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-orange-500 hover:bg-orange-50 rounded-xl text-xs font-bold tracking-wide transition-all duration-200">
                <Plus size={13} />
                Add Item
              </button>
            )}
          </div>

          <div className="p-6">

            {/* ── Account Tab ── */}
            {activeTab === "account" && (
              <div>
                

                {/* Alerts */}
                {error && (
                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500 font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Section: Basic Info */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-orange-500 rounded-full" />
                      <p className="text-sm font-semibold text-gray-700">Basic Information</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email — disabled */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Locked</span>
                        </div>
                      </div>

                      {/* Username */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Your username"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Your phone number"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>

                      {/* Profile Photo URL */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profile Photo URL</label>
                        <input
                          type="text"
                          value={profilePhotoUrl}
                          onChange={(e) => setProfilePhotoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 my-5" />

                  {/* Section: Location */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-orange-500 rounded-full" />
                      <p className="text-sm font-semibold text-gray-700">Location</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Your city"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Your state"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-fit px-10 mx-auto py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group shadow-md shadow-orange-100"
                  >
                    {loading ? "Saving changes..." : "Save Changes"}
                    {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />}
                  </button>
                </form>
              </div>
            )}

            {/* ── My Items Tab ── */}
            {activeTab === "myitems" && renderMyItems()}

            {/* ── Wishlist Tab ── */}
            {activeTab === "wishlist" && renderWishlist()}

            {/* ── Sold Items Tab ── */}
            {activeTab === "solditems" && renderSoldItems()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}