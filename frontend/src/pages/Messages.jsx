import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { getAuthToken } from "../utils/tokenUtils";
import { MessageCircle, ArrowRight, Clock } from "lucide-react";

export default function Messages() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:8080/chat/rooms", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 mt-[64px] flex flex-col">
      <div className="flex-grow max-w-3xl w-full mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-orange-500 mb-1">
            Inbox
          </p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Messages</h1>
          <p className="text-sm text-gray-400 mt-1">Your active negotiations are listed below.</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Panel Header */}
          <div className="bg-gray-900 px-5 py-4 flex items-center gap-3">
            <MessageCircle size={14} className="text-orange-400" />
            <span className="text-[11px] font-bold tracking-[3px] uppercase text-white">
              Conversations
            </span>
          </div>

          <div className="p-5">
            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold tracking-widest uppercase text-gray-400">Loading...</p>
              </div>

            ) : error ? (
              /* Error */
              <div className="flex items-center justify-center py-12">
                <p className="text-sm font-semibold text-red-500">{error}</p>
              </div>

            ) : rooms.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <MessageCircle size={28} className="text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="text-gray-900 font-bold text-base mb-1">No conversations yet</p>
                  <p className="text-gray-400 text-sm">Start chatting by browsing items below.</p>
                </div>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-orange-500 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-200 group"
                >
                  Browse Items
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>

            ) : (
              /* Room List */
              <div className="flex flex-col gap-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/chat/room/${room.id}`)}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                      <img
                        src={room.itemImageUrl || "/placeholder.png"}
                        alt={room.itemName}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="font-black text-gray-900 text-sm truncate">
                          {room.otherUserName || "User"}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0 text-gray-400">
                          <Clock size={10} />
                          <span className="text-[10px] font-medium">
                            {new Date(room.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-orange-500 mb-1 truncate">{room.itemName}</p>
                      <p className="text-xs text-gray-400 truncate">{room.lastMessage}</p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight
                      size={16}
                      className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}