import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthToken } from "../utils/tokenUtils";
import { ArrowLeft, ImagePlus, Send, MessageCircle } from "lucide-react";

export default function ChatPage() {
  const { roomId } = useParams();
  const [item, setItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const token = getAuthToken();

  const getCurrentUserEmail = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.email;
    } catch { return null; }
  };

  const currentUserEmail = getCurrentUserEmail();
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const loadData = async () => {
      try {
        const roomRes = await fetch(`http://localhost:8080/chat/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!roomRes.ok) throw new Error("Failed to load chat room.");
        const roomData = await roomRes.json();

        const itemRes = await fetch(`http://localhost:8080/items/${roomData.itemId}`);
        if (!itemRes.ok) throw new Error("Failed to load item details.");
        setItem(await itemRes.json());

        const msgRes = await fetch(`http://localhost:8080/chat/rooms/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!msgRes.ok) throw new Error("Failed to load message history.");
        setMessages(await msgRes.json());
      } catch (err) { setError(err.message); }
    };
    loadData();
  }, [roomId, token, navigate]);

  useEffect(() => {
    if (!token || !roomId) return;
    const wsUrl = `ws://localhost:8080/ws/chat?roomId=${roomId}&token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => { setConnected(true); setError(""); };
    ws.onmessage = (event) => {
      try { setMessages((prev) => [...prev, JSON.parse(event.data)]); }
      catch (err) { console.warn("Invalid chat message:", err); }
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setError("Unable to connect to chat server.");
    return () => { if (ws && ws.readyState === WebSocket.OPEN) ws.close(); };
  }, [roomId, token]);

  const handleSend = () => {
    if (!newMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ text: newMessage.trim() }));
    setNewMessage("");
  };

  const handleImageSelect = () => fileInputRef.current?.click();

  const uploadImageAndSend = async (file) => {
    if (!file || !token || !roomId) return;
    setImageError(""); setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`http://localhost:8080/chat/rooms/${roomId}/upload-image`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (!res.ok) { const errorText = await res.text(); throw new Error(errorText || "Image upload failed."); }
      const data = await res.json();
      if (!data?.imageUrl) throw new Error("Upload did not return an image URL.");
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
        wsRef.current.send(JSON.stringify({ text: "", imageUrl: data.imageUrl, type: "image" }));
    } catch (err) { setImageError(err.message || "Failed to send image."); }
    finally { setImageUploading(false); }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageAndSend(file);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!token) return null;

  return (
    // Full viewport, no scroll on outer container
    <div className="fixed inset-0 top-[64px] bg-gray-100 flex flex-col overflow-hidden">

      {/* ── Orange Top Banner ── */}
      <div className="bg-orange-500 w-full flex-shrink-0">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-white" />
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">Negotiation Chat</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-white animate-pulse" : "bg-orange-200"}`} />
                <p className="text-orange-100 text-xs">{connected ? "Connected" : "Connecting..."}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-sm transition-all duration-200 group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Item
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex-shrink-0 max-w-5xl w-full mx-auto px-4 pt-3">
          <div className="px-4 py-3 bg-white border-l-4 border-red-500 shadow-sm text-sm text-red-500 font-medium">
            {error}
          </div>
        </div>
      )}

      {/* ── Body: fills remaining height ── */}
      <div className="flex-1 overflow-hidden max-w-5xl w-full mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">

        {/* ── LEFT: Item Card ── */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Item</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {item ? (
              <div className="p-4 flex flex-col gap-3">
                <div className="aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.imageUrls?.[0] || "/placeholder.png"}
                    alt={item.name}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{item.name}</p>
                  <p className="text-xl font-extrabold text-orange-500 mt-1">₹{item.price}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 uppercase tracking-wide">
                    {item.category}
                  </span>
                </div>
                <div className="h-px bg-gray-100" />
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{item.description}</p>
                {item.isNegotiable && (
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    Negotiable
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Chat ── */}
        <div className="flex-1 flex flex-col bg-white shadow-sm overflow-hidden min-h-0">

          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Messages</p>
            <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
              connected ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              {connected ? "Live" : "Offline"}
            </div>
          </div>

          {/* Messages Area — only this scrolls */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center">
                  <MessageCircle size={24} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start the negotiation with a friendly offer!</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.senderEmail === currentUserEmail;
                  if (msg.type === "system") return null;
                  return (
                    <div key={index} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 ${
                        isCurrentUser
                          ? "bg-orange-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "bg-white text-gray-800 border border-gray-200 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm"
                      }`}>
                        {!isCurrentUser && (
                          <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500 mb-1">
                            {msg.senderRole === "owner" ? "Seller" : "Buyer"}
                          </p>
                        )}
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="shared"
                            className="w-full max-h-60 object-cover rounded-xl mb-2 border border-white/20" />
                        )}
                        {msg.text && (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        )}
                        <p className={`text-[10px] mt-1.5 ${isCurrentUser ? "text-orange-100" : "text-gray-400"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area — always pinned at bottom */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleImageSelect}
                disabled={!connected || imageUploading}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-orange-400 hover:text-orange-500 text-gray-400 rounded-sm transition-all duration-200 disabled:opacity-40"
              >
                <ImagePlus size={16} />
              </button>

              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-sm px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />

              <button
                onClick={handleSend}
                disabled={!connected || !newMessage.trim()}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-sm transition-all duration-200"
              >
                <Send size={15} />
              </button>
            </div>

            {imageError && <p className="mt-2 text-xs text-red-500">{imageError}</p>}

            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">Enter to send · Shift+Enter for new line</p>
              {imageUploading && <p className="text-[10px] font-semibold text-orange-500 animate-pulse">Uploading...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 