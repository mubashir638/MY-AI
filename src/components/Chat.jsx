import React, { useState } from "react";
import { Trash2, Bot, Mic, Send } from "lucide-react";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);

  const getStorechats = () => {
    return JSON.parse(localStorage.getItem("chats") || "[]");
  };
  const saveChatsLocalStorage = (chats) => {
    localStorage.setItem("chats", JSON.stringify(chats));
  };

  const generateBotReply = async (userText, userMessage) => {
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: userText }],
        },
      ],
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      const botText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      const botMessage = { sender: "bot", text: botText };

      setMessages((prev) => [...prev, botMessage]);

      const chats = getStorechats();
      const newChat = {
        id: `chat-${Date.now()}`,
        title: userText.slice(0, 30),
        messages: [userMessage, botMessage],
      };
      saveChatsLocalStorage([newChat, ...chats]);
    } catch (error) {
      console.error("Gemini API Error:", error.message);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: ` Error: ${error.message}` },
      ]);
    }
  };

  const handleSend = async () => {
    if (message.trim() === "") return;

    const userMessage = { sender: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    await generateBotReply(message, userMessage);
    setIsTyping(false);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setMessage("");
    setIsTyping(false);
  };

  const handleSelectChat = (chat) => {
    setMessages(chat.messages);
  };

  const handleMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      handleSend();
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <section className=" ml-[-85px]  sm:ml-24 xl:ml-0 lg:ml-12 flex flex-col h-screen text-white  ">
      {/* Navbar */}
      <div className="flex items-center justify-between  ml-0 xl:ml-[-15px] bg-gradient-to-br from-[#1e002c] via-[#3a006f] to-[#120026] p-3">
        <div className="flex items-center space-x-2">
          <div className="bg-[#130E21] rounded-full ml-[80px]  sm:ml-14 p-2">
            <Bot className="h-7 w-7 text-blue-600" />
          </div>
          <div className=" flex-col hidden sm:flex">
            <span className="font-medium">AI Chat</span>
            <span className="text-xs text-gray-400">Powered by Gemini</span>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center px-2 py-1 bg-[#155DFC] xl:mr-10  rounded-sm sm:rounded-md"
        >
          <Trash2 size={20} className="sm:mr-1" />
          <span className="hidden sm:block">Clear</span>
        </button>
      </div>

      <hr className="border-zinc-700  ml-0 xl:ml-[-15px]" />

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-[#130E21] rounded-full p-3 mb-3">
              <Bot className="h-12 w-12 text-blue-600" />
            </div>
            <div className="text-center font-semibold sm:text-xl mb-2">
              Start a Conversation
            </div>
            <div className="max-w-xs bg-transparent border rounded-lg p-4 space-y-3 text-sm sm:text-xl ">
              <h2 className=" font-semibold flex items-center">
                Welcome to AI Chat!
                <Bot size={16} className="ml-2 text-gray-400" />
              </h2>
              <p>How can I help you today?</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 ml-5 sm:ml-0 ">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex  ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg sm:max-w-2xl  text-sm sm:text-lg break-words whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-[#1e002c] via-[#3a006f] to-[#120026] text-white"
                      : "bg-purple-600 text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-1 bg-[#155DFC] p-2 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-zinc-700 ml-0 xl:ml-[-15px] " />

      {/* Input area */}
      <div className="flex items-center  ml-0 xl:ml-[-15px] p-3 space-x-2 bg-gradient-to-br from-[#1e002c] via-[#3a006f] to-[#120026]">
        <div className="flex items-center ml-[15px]  sm:ml-0 bg-black p-2 rounded-lg w-full max-w-xl border border-purple-500">
          <input
            type="text"
            placeholder="Type your message ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            className="flex-1 w-[50%] sm:w-full text-white placeholder-gray-400 outline-none px-2 bg-transparent"
          />
        </div>
        <button
          onClick={handleMic}
          disabled={listening}
          className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 transition-colors"
        >
          <Mic className="text-white w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default Chat;

