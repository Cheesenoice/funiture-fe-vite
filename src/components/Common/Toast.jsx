import { useState, useEffect } from "react";

function Toast({ message, type, duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      case "warning":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  return (
    isVisible && (
      <div
        className={`toast toast-top toast-center z-50 fixed bottom-5 right-5 ${getToastStyle()} p-4 rounded-lg shadow-lg w-72`}
      >
        <div className="flex justify-between items-center">
          <span>{message}</span>
          <button
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            className="text-white ml-2"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      </div>
    )
  );
}

export default Toast;
