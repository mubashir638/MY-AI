import React, { useState } from "react";
import { Menu, X, Trash2, Ellipsis } from "lucide-react";

const Chathistory = ({ chats, setChats, onSelectChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenuForId, setShowMenuForId] = useState(null);

  const handleSelect = (chat) => {
    onSelectChat(chat);
    setIsOpen(false);
  };

  const deleteSingleChat = (id) => {
    const filtered = chats.filter((chat) => chat.id !== id);
    setChats(filtered);
    localStorage.setItem("chats", JSON.stringify(filtered));
    setShowMenuForId(null);
  };

  const clearAllChats = () => {
    localStorage.removeItem("chats");
    setChats([]);
    setShowMenuForId(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-purple-600 text-white rounded-full"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`overflow-y-auto top-0 left-0 z-40 h-full w-64 bg-[#0c0a1a] text-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`}
      >
        <div className="p-4 h-full overflow-y-auto relative">
          {/* Close button inside sidebar for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 md:hidden text-white"
          >
            <X size={24} />
          </button>

          <h1 className="text-xl font-semibold underline mb-4">CHAT HISTORY</h1>
          {chats.length === 0 ? (
            <p className="text-sm text-gray-400">No chat history</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  className="relative group flex justify-between items-center bg-[#155DFC] rounded-md p-2"
                >
                  <span
                    className="cursor-pointer text-sm flex-1 pr-2"
                    onClick={() => handleSelect(chat)}
                  >
                    {chat.title}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Ellipsis
                      size={20}
                      className="cursor-pointer text-white hover:text-white"
                      onClick={() =>
                        setShowMenuForId((prev) =>
                          prev === chat.id ? null : chat.id
                        )
                      }
                    />
                  </div>

                  {showMenuForId === chat.id && (
                    <div className="absolute right-2 top-10 z-50 w-48 bg-gradient-to-br from-[#1e002c] via-[#3a006f] to-[#120026] text-white shadow-lg rounded-md border border-zinc-700 py-2 text-sm">
                      <button
                        onClick={() => deleteSingleChat(chat.id)}
                        className="flex cursor-pointer w-full items-center gap-2 px-4 py-2 text-left hover:bg-red-600 hover:rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-white" />
                        <span className="text-white">Delete this chat</span>
                      </button>
                      <button
                        onClick={clearAllChats}
                        className="flex cursor-pointer w-full items-center gap-2 px-4 py-2 text-left hover:bg-red-600 hover:rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-white" />
                        <span className="text-white">Clear all history</span>
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
};

export default Chathistory;
