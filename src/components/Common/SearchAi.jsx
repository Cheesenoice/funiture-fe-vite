// src/components/SearchAiModal.jsx

import React, { useState, useEffect, useRef } from "react";
import { SendHorizonal, X, Bot, Plus } from "lucide-react";
import SuggestionCard from "./SuggestionCard";

// Helper function to determine bubble classes based on sender
const getMessageBubbleClasses = (from) => {
  const baseClasses =
    "max-w-[90%] p-3 rounded-lg shadow-sm break-words text-sm";
  return from === "user"
    ? `${baseClasses} bg-red-500 text-white rounded-br-none`
    : `${baseClasses} bg-white text-gray-800 rounded-bl-none border border-gray-200`;
};

export default function SearchAiModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Xin chào! Tôi là AI hỗ trợ khách hàng. Bạn cần tìm gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const widgetRef = useRef(null);

  // Scroll to the latest message whenever messages change or widget opens
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); // No delay
    }
  }, [messages, isOpen]);

  // Generate image preview URL when a file is selected
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  // Function to handle sending message (text and/or file)
  const sendMessage = async () => {
    if ((!input.trim() && !file) || loading) return;

    const userMsg = {
      from: "user",
      text: input || (file ? "Đã gửi hình ảnh" : ""),
      image: filePreview,
    };

    if (userMsg.text || userMsg.image) {
      setMessages((prev) => [...prev, userMsg]);
    } else {
      setInput("");
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setInput(""); // Clear input immediately
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setLoading(true);

    const formData = new FormData();
    if (input.trim()) {
      formData.append("keyword", input.trim());
    }
    if (file) {
      formData.append("roomImage", file);
    }

    try {
      const res = await fetch("http://localhost:3000/api/v1/searchAi", {
        method: "POST",
        body: formData,
      });

      let aiMessage = { from: "ai" };
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `API error: ${res.status} ${res.statusText}${
            errorData.message ? ` - ${errorData.message}` : ""
          }`
        );
      }

      const data = await res.json();

      if (data?.reply) {
        aiMessage.text = data.reply;
      }

      if (data?.suggestions && data.suggestions.length > 0) {
        if (!aiMessage.text) {
          aiMessage.text =
            data.additionalReply || "Dưới đây là các sản phẩm đề xuất cho bạn:";
        } else if (data.additionalReply) {
          aiMessage.text = `${aiMessage.text}\n\n${data.additionalReply}`;
        }
        aiMessage.suggestions = data.suggestions;
      } else if (!data?.reply) {
        aiMessage.text =
          "AI phản hồi không đúng định dạng hoặc không tìm thấy gợi ý nào. 😕";
      }

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: `Đã xảy ra lỗi: ${
            err.message || "Không thể kết nối đến server 😢"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  // Trigger hidden file input click
  const openFileSelector = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  // Handle clicks outside the widget to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        widgetRef.current &&
        !widgetRef.current.contains(event.target)
      ) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
  };

  // Determine if send button should be disabled
  const isSendDisabled = loading || (!input.trim() && !file);

  return (
    <div
      ref={widgetRef}
      className={`
        fixed bottom-4 right-4 z-50
        shadow-lg rounded-md bg-white overflow-hidden transition-all duration-300 ease-in-out
        ${
          isOpen
            ? "w-80 md:w-96 h-[70vh] max-h-[600px] flex flex-col"
            : "p-2 w-30 h-16 flex items-center justify-center cursor-pointer bg-gradient-to-r from-red-500 to-indigo-600 text-white hover:from-red-600 hover:to-indigo-700 hover:scale-105 rounded-md" // Changed rounded-xl to rounded-md here
        }
      `}
      onClick={!isOpen ? () => setIsOpen(true) : undefined}
      title={!isOpen ? "Bạn cần tư vấn, hãy hỏi ngay <3" : undefined} // Added title for hover text
    >
      {!isOpen ? (
        <div className="flex flex-row gap-2 items-center justify-center w-full h-full">
          <Bot size={28} />
          <h1 className="text-sm text-center font-semibold mt-1">
            Chatbot CSKH
          </h1>
        </div>
      ) : (
        <>
          {/* Widget Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-500 to-indigo-600 text-white flex-shrink-0 rounded-t-md">
            {" "}
            {/* Added rounded-t-md */}
            <h3 className="text-base font-semibold">AI Hỗ Trợ</h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle bg-white/20 hover:bg-white/30 border-none"
              aria-label="Đóng chatbot"
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  } items-start`}
                >
                  <div className={getMessageBubbleClasses(msg.from)}>
                    {msg.text &&
                      msg.text.split("\n").map((line, lineIndex) => (
                        <React.Fragment key={lineIndex}>
                          {line}
                          {lineIndex < msg.text.split("\n").length - 1 && (
                            <br />
                          )}
                        </React.Fragment>
                      ))}

                    {msg.from === "user" && msg.image && (
                      <img
                        src={msg.image}
                        alt="Hình ảnh đã gửi"
                        className="mt-2 w-24 h-24 object-cover rounded-md block"
                      />
                    )}
                  </div>
                </div>

                {msg.suggestions && msg.from === "ai" && (
                  <div className="mt-3 space-y-2">
                    {msg.suggestions.map((suggestion, index) => (
                      <SuggestionCard key={index} suggestion={suggestion} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <span className="loading loading-dots loading-sm text-gray-500"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 flex flex-col gap-2 flex-shrink-0 rounded-b-md">
            {" "}
            {/* Added rounded-b-md */}
            {/* Display File Preview */}
            {filePreview && (
              <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-300 shadow-sm">
                <img
                  src={filePreview}
                  alt="Xem trước ảnh"
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600"
                  aria-label="Xóa ảnh đã chọn"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            {/* Input and Send Button Row */}
            <div className="flex gap-2 items-end">
              {/* Using textarea for potentially multiline input */}
              <textarea
                className="textarea textarea-bordered w-full bg-gray-100 border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 rounded-lg min-h-[40px] max-h-[80px] resize-y text-sm p-2"
                placeholder={loading ? "Đang phản hồi..." : "Nhập câu hỏi..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={1}
              ></textarea>
              {/* Send Message Button */}
              <button
                className="btn btn-square btn-sm bg-red-500 hover:bg-red-600 text-white rounded-lg border-none flex-shrink-0"
                onClick={sendMessage}
                disabled={isSendDisabled}
                aria-label="Gửi tin nhắn"
              >
                <SendHorizonal size={16} />
              </button>
            </div>
            {/* File Upload Button and Hidden Input */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openFileSelector}
                className="btn btn-sm rounded-full bg-gray-200 hover:bg-gray-300 border-none text-gray-600 flex-shrink-0"
                aria-label="Chọn ảnh"
                disabled={loading}
              >
                <Plus size={16} />
              </button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              {/* Display selected file name or hint */}
              {file ? (
                <span className="text-xs text-gray-500 truncate">
                  {file.name}
                </span>
              ) : (
                !loading && (
                  <span className="text-xs text-gray-500">
                    Chọn ảnh (tùy chọn)
                  </span>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
