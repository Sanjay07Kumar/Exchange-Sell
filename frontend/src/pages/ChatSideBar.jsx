import { FaWindowClose } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../utils/tokenUtils";
import { MessageCircle, ArrowRight, Clock, X } from "lucide-react";

export default function ChatSidebar({ closeChat }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Login required to view chats.");
        setLoading(false);
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
  }, []);

  const handleChatClick = (roomId) => {
    navigate(`/chat/room/${roomId}`);
    closeChat();
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-[360px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">

      {/* ── Header ── */}
      <div className="bg-gray-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <MessageCircle size={15} className="text-orange-400" />
          <div>
            <p className="text-[10px] font-bold tracking-[3px] uppercase text-orange-400">Inbox</p>
            <h2 className="text-sm font-black text-white tracking-tight">Your Messages</h2>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-orange-500 text-white transition-all duration-200"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Chat List ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50">

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Loading...</p>
          </div>

        ) : error ? (
          /* Error */
          <div className="m-4 p-5 bg-white border border-gray-200 rounded-2xl flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-gray-600 font-medium">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-orange-500 text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-200 group"
            >
              Login to view chats
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

        ) : rooms.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
              <MessageCircle size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">No conversations yet</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                When you message a seller, your chat will appear here.
              </p>
            </div>
          </div>

        ) : (
          /* Room List */
          <div className="p-3 flex flex-col gap-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleChatClick(room.id)}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
              >
                {/* Image */}
                <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={room.itemImageUrl || "/placeholder.png"}
                    alt={room.itemName}
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-sm font-black text-gray-900 truncate">
                      {room.otherUserName || "User"}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0 text-gray-400">
                      <Clock size={9} />
                      <span className="text-[10px] font-medium">
                        {new Date(room.lastUpdated).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-orange-500 truncate mb-0.5">{room.itemName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{room.lastMessage}</p>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={14}
                  className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {rooms.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
          <button
            onClick={() => { navigate("/messages"); closeChat(); }}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-orange-400 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 group"
          >
            View All Messages
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      )}
    </div>
  );
}