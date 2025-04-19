import { useState, useEffect, useRef } from "react";
import { SendHorizonal, X, Bot } from "lucide-react";
import ProductCard from "./ProductCard"; // Adjust path as needed

export default function SearchAiModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Xin chào! Tôi là AI hỗ trợ khách hàng. Bạn cần tìm gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/v1/searchAi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: input }),
      });

      const data = await res.json();

      if (data?.reply) {
        setMessages((prev) => [...prev, { from: "ai", text: data.reply }]);
      } else if (data?.suggestions) {
        setMessages((prev) => [
          ...prev,
          {
            from: "ai",
            text:
              data.additionalReply ||
              "Dưới đây là các sản phẩm đề xuất cho bạn:",
            suggestions: data.suggestions,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "Ôi, có gì đó không ổn rồi 😔" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Không thể kết nối đến server 😢" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      {/* Trigger Button */}
      <button
        className="btn bg-gradient-to-r from-red-500 to-indigo-600 text-white border-none hover:from-red-600 hover:to-indigo-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-transform hover:scale-105"
        onClick={openModal}
        aria-label="Mở chatbot hỗ trợ"
      >
        <Bot size={24} />
        <p>Chat ngay</p>
      </button>

      {/* Modal */}
      <div className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box relative w-11/12 max-w-lg sm:max-w-xl md:max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col h-[80vh] p-0 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-500 to-indigo-600 text-white">
            <h3 className="text-lg font-semibold">AI Hỗ Trợ Khách Hàng</h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle bg-white/20 hover:bg-white/30 border-none"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                      msg.from === "user"
                        ? "bg-red-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                {msg.suggestions && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {msg.suggestions.map((product, index) => (
                      <ProductCard
                        key={index}
                        product={{
                          ...product,
                          slug: product.title
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                          price: product.price,
                          thumbnail: product.thumbNail,
                          name: product.title,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
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
          <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              className="input w-full bg-gray-100 border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 rounded-lg"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn bg-red-500 hover:bg-red-600 text-white rounded-lg border-none"
              onClick={sendMessage}
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
