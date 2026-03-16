import { FaWindowClose } from "react-icons/fa";

export default function ChatSidebar({ closeChat }) {

  const chats = [
    { id: 1, name: "Seller - Laptop Store", last: "Is this still available?" },
    { id: 2, name: "Mobile Shop", last: "Price negotiable?" },
    { id: 3, name: "Headphones Seller", last: "Shipping tomorrow" }
  ];

  return (
    <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-2xl z-50 flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>

        <button
          onClick={closeChat}
          className="text-gray-600 hover:text-red-500"
        >
          <FaWindowClose size={20}/>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">

        {chats.map(chat => (
          <div
            key={chat.id}
            className="p-4 border-b hover:bg-gray-100 cursor-pointer"
          >
            <h3 className="font-semibold text-sm">{chat.name}</h3>
            <p className="text-xs text-gray-500">{chat.last}</p>
          </div>
        ))}

      </div>
      
    </div>
    
  );
}
