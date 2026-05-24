"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import CustomToast, { ToastType } from "@/components/CustomToast";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as ToastType });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
  };

  // Redirect if admin is already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("يرجى إدخال البريد الإلكتروني وكلمة المرور 🔐", "error");
      return;
    }

    // Force constraints for exact admin credentials
    if (email.trim().toLowerCase() !== "admin@gmail.com") {
      showToast("عذراً، هذا الحساب ليس مسجلاً كمدير للمنصة! 🔒", "error");
      return;
    }

    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showToast("أهلاً بك يا مدير المنصة! تم الدخول بنجاح 🛡️✨", "success");
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      showToast("خطأ في تسجيل الدخول. تأكد من صحة كلمة المرور! ❌", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A202C] text-white">
        <div className="w-12 h-12 rounded-full border-4 border-blue-400 border-t-transparent animate-spin mb-4"></div>
        <p className="font-extrabold text-lg text-gray-300">جاري التحقق من التراخيص الأمنية... 🔐</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAFF]">
      <Navbar />

      <CustomToast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[grid_rgba(0,0,0,0.03)_24px_24px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white border-4 border-gray-800 rounded-[36px] shadow-2xl p-6 md:p-8 relative z-10">
          
          {/* Badge icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 border-3 border-gray-800 flex items-center justify-center text-blue-500 shadow-sm animate-bounce-subtle">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-800 tracking-wide">بوابة المشرفين | سند 🛡️</h2>
            <p className="text-xs font-bold text-gray-400 mt-1">تنبيه: هذه المنطقة مخصصة لإدارة المنصة ومتابعة مشكلات الأطفال فقط.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5 text-right">
              <label className="font-extrabold text-gray-700 text-sm flex items-center gap-1.5 justify-start">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>البريد الإلكتروني للمشرف:</span>
              </label>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-3 border-gray-200 hover:border-gray-800 focus:border-gray-800 focus:outline-none rounded-2xl font-bold text-sm text-left dir-ltr"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <label className="font-extrabold text-gray-700 text-sm flex items-center gap-1.5 justify-start">
                <Lock className="w-4 h-4 text-pink-500" />
                <span>كلمة المرور الخاصة بالإدارة:</span>
              </label>
              <input
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-3 border-gray-200 hover:border-gray-800 focus:border-gray-800 focus:outline-none rounded-2xl font-bold text-sm text-left dir-ltr"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className={`w-full py-4.5 mt-2 bg-gray-800 text-white font-black text-lg rounded-2xl border-3 border-gray-900 shadow-lg hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                loginLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loginLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>جاري التحقق من التصاريح...</span>
                </>
              ) : (
                <>
                  <span>تسجيل دخول المدير 🔐</span>
                </>
              )}
            </button>

          </form>

          <Link
            href="/"
            className="flex items-center justify-center gap-1 mt-6 text-xs font-black text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة للرئيسية</span>
          </Link>

        </div>
      </main>

      <Footer />
    </div>
  );
}
