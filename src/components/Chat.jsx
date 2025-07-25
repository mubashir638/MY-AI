import React, { useState, useEffect, useRef } from "react";
import { Trash2, Bot, Mic, Send, Volume2, Square } from "lucide-react";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [Sendmessage, setSendMessage] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  const defaultSuggestions = [
    "Summarize this article",
    "Write an email",
    "Explain a concept",
    "Give me study tips",
    "What's the weather?",
    "Write a cover letter for a developer job",
    "Give me a fun fact",
    "Summarize this YouTube video",
    "Create a slogan for my brand",
    "Explain AI to a 5-year-old",
    "Suggest a weekend movie",
    "Write a tweet about motivation",
    "Generate a quiz about history",
    "Give me startup name ideas",
    "Plan a birthday party",
    "Design a morning routine",
    "Write a scary story in 3 lines",
    "What are today’s top news?",
    "Give a random life hack",
    "Convert this to passive voice",
    "How do I start freelancing?",
    "Generate a riddle",
    "Write lyrics in rap style",
    "Explain the stock market basics",
    "Write a short script scene",
  ];

  function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const [promptSuggestions, setPromptSuggestions] = useState([]);

  useEffect(() => {
    setPromptSuggestions(shuffle(defaultSuggestions).slice(0, 3));
  }, []);

  const [selectedTag, setSelectedTag] = useState("General");

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
        tag: selectedTag,
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

  const fileInputRef = useRef(null);
  const handleAttachFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };

  const handleSend = async () => {
    if (message.trim() === "") return;
    const userMessage = { sender: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);
    setSendMessage(true);
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

  const speak = (text, index) => {
    if (speechSynthesis.speaking && speakingIndex === index) {
      speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    speechSynthesis.speak(utterance);
  };

  const messagesRef = useRef("");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesRef.current = messages;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setSendMessage(false);
  }, [messages]);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingText(messages[index].text);
  };

  const handleEditKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newMessages = [...messages];
      const original = newMessages[editingIndex];
      newMessages[editingIndex] = { ...original, text: editingText };
      setMessages(newMessages.slice(0, editingIndex + 1));
      setEditingIndex(null);
      setIsTyping(true);
      await generateBotReply(editingText, newMessages[editingIndex]);
      setIsTyping(false);
    }
  };

  return (
    <section className="ml-[-85px] sm:ml-24 xl:ml-0 lg:ml-12 flex flex-col h-screen text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between ml-0 xl:ml-[-30px] bg-gradient-to-br from-[#1e002c] via-[#3a006f] to-[#120026] p-3">
        <div className="flex items-center space-x-2">
          <div className="bg-[#130E21] rounded-full ml-[80px] sm:ml-14  p-2">
            <Bot className="h-7 w-7 text-blue-600" />
          </div>
          <div className="flex-col hidden sm:flex">
            <span className="font-medium">AI Chat</span>
            <span className="text-xs text-gray-400">Powered by Gemini</span>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center px-2 py-1 bg-[#155DFC] xl:mr-10 rounded-sm sm:rounded-md"
        >
          <Trash2 size={20} className="sm:mr-1" />
          <span className="hidden sm:block">Clear</span>
        </button>
      </div>

      <hr className="border-zinc-700 ml-0 xl:ml-[-35px]" />

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
              <h2 className="font-semibold flex items-center">
                Welcome to AI Chat!
                <Bot size={16} className="ml-2 text-gray-400" />
              </h2>
              <p>How can I help you today?</p>
            </div>

            <div className="mt-4 text-sm sm:text-base text-gray-300  flex flex-col items-center">
              <div className=" flex flex-col sm:flex-row justify-center gap-2 md:ml-1 xl:ml-0">
                {promptSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(s)}
                    className="bg-purple-700 cursor-pointer hover:bg-purple-800 text-white px-3 py-1 rounded-md text-xs sm:text-sm transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 ml-2 sm:ml-0">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="flex items-start mr-2 mt-1">
                    <div className="bg-[#130E21] rounded-full p-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}
                <div
                  className={`relative px-4 py-2 rounded-lg max-w-[90%] sm:max-w-2xl text-sm sm:text-lg break-words whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-[#155DFC] text-white"
                      : "bg-purple-600 text-gray-200"
                  }`}
                  onClick={() =>
                    msg.sender === "user" ? handleEdit(index) : null
                  }
                >
                  {editingIndex === index ? (
                    <input
                      className="w-full bg-transparent text-white outline-none border-b border-gray-400"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                    />
                  ) : (
                    msg.text
                  )}
                  {msg.sender !== "user" && (
                    <div className="mt-1 flex justify-end">
                      <button
                        onClick={() => speak(msg.text, index)}
                        className="text-white p-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 "
                        title={speakingIndex === index ? "Stop" : "Listen"}
                      >
                        {speakingIndex === index ? (
                          <Square size={18} />
                        ) : (
                          <Volume2 size={18} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start h-10 ml-[-10px] ">
                <div className="bg-[#130E21] rounded-full p-2 mr-2 mt-1">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex space-x-1 h-7 mt-2 bg-[#155DFC] p-2 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <hr className="border-zinc-700 ml-0 xl:ml-[-15px]" />

      {/* Input area */}
      <div className="flex items-center xl:ml-[-29px] p-3 space-x-2 bg-gradient-to-br from-[#1e002c] via-[#3a006f] to-[#120026]">
        <div className="flex items-center ml-4 sm:ml-0 xl:ml-5 flex-grow bg-black p-2 rounded-lg border border-purple-500">
          <input
            type="text"
            placeholder="Type your message ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            className="w-full text-white placeholder-gray-400 outline-none px-2 bg-transparent"
          />
        </div>

        <button
          onClick={handleMic}
          disabled={listening}
          className="p-3 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 transition-colors"
        >
          <Mic className="text-white w-5 h-5" />
        </button>

        <button
          onClick={handleAttachFile}
          className="p-3 rounded-full cursor-pointer bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 transition-colors"
          title="Attach file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16.5 7.5L7.5 16.5a3 3 0 004.24 4.24l9-9a5 5 0 00-7.07-7.07l-10 10"
            />
          </svg>
        </button>

        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleSend}
          className="p-3 rounded-full bg-gradient-to-r cursor-pointer from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default Chat;