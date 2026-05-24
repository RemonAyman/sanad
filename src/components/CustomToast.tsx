"use client";

import React, { useEffect } from "react";
import { Star, AlertCircle, CheckCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface CustomToastProps {
  message: string;
  type: ToastType;
  show: boolean;
  onClose: () => void;
}

export default function CustomToast({ message, type, show, onClose }: CustomToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgClasses = {
    success: "bg-[#68D391] border-[#2D3748] text-white",
    error: "bg-[#F56565] border-[#2D3748] text-white",
    info: "bg-[#63B3ED] border-[#2D3748] text-white",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 animate-bounce-subtle" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Star className="w-5 h-5 flex-shrink-0 fill-white" />,
  };

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-subtle" style={{ animationDuration: '0.5s' }}>
      <div className={`flex items-center gap-3 px-6 py-4.5 rounded-3xl border-3 shadow-kids font-bold text-base md:text-lg min-w-[280px] text-center ${bgClasses[type]}`}>
        {icons[type]}
        <span>{message}</span>
      </div>
    </div>
  );
}
