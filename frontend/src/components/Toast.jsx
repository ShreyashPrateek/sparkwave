import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "../context/ToastContext";

const Toast = ({ toast }) => {
  const { removeToast } = useToast();

  const getIcon = () => {
    switch (toast.type) {
      case "success": return <CheckCircle size={20} />;
      case "error": return <AlertCircle size={20} />;
      case "warning": return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success": return "bg-green-500 border-green-400";
      case "error": return "bg-red-500 border-red-400";
      case "warning": return "bg-yellow-500 border-yellow-400";
      default: return "bg-blue-500 border-blue-400";
    }
  };

  return (
    <div className={`${getStyles()} backdrop-blur-lg bg-opacity-90 border rounded-xl p-4 shadow-lg flex items-center gap-3 min-w-80 animate-slide-in`}>
      {getIcon()}
      <span className="text-white flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}