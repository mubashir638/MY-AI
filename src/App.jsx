
import React, { useState, useEffect } from "react";
import Chat from "./components/Chat";
import Chathistory from "./components/Chathistory";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("chats") || "[]");
    setChatHistory(stored);
  }, []);

  const updateChatHistory = (chats) => {
    setChatHistory(chats);
    localStorage.setItem("chats", JSON.stringify(chats));
  };

  return (
    <div className="grid grid-cols-[20%_80%] bg-gradient-to-br from-[#1e002c] via-[#3a006f] to-[#120026] h-screen">
      <Chathistory
        chats={chatHistory}
        setChats={updateChatHistory}
      />
      <Chat
        chatHistory={chatHistory}
        setChatHistory={updateChatHistory}
      />
    </div>
  );
};

export default App;
