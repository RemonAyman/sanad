"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import CustomToast, { ToastType } from "@/components/CustomToast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Sparkles, Heart, Smile, Star, ArrowRight, Lock, Mail, User } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as ToastType });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      showToast("يرجى ملء جميع الحقول المطلوبة يا بطل! ✍️", "error");
      return;
    }

    if (password.length < 6) {
      showToast("كلمة المرور يجب أن تكون 6 أحرف أو أكثر لحماية حسابك 🔒", "error");
      return;
    }

    setAuthLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email.trim(), password);
        showToast("أهلاً بك مجدداً! تم تسجيل الدخول بنجاح 🌟", "success");
      } else {
        // SIGNUP
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const newUser = userCredential.user;

        // Set display name in Auth
        await updateProfile(newUser, { displayName: name.trim() });

        // Seed profile document in Firestore
        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: "child",
          stars: 5, // Give them 5 starter stars for joining!
          badges: ["صديق جديد 🤝"],
        });

        showToast("تهانينا يا بطل! تم إنشاء حسابك وحصلت على 5 نجوم هدية! 🎁⭐", "success");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMsg = "حدث خطأ ما، يرجى المحاولة مرة أخرى 😢";
      if (error.code === "auth/email-already-in-use") {
        errorMsg = "هذا البريد الإلكتروني مسجل بالفعل! جرب تسجيل الدخول 🎒";
      } else if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        errorMsg = "البريد الإلكتروني أو كلمة المرور غير صحيحة، تأكد منهما يا بطل 🧐";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "البريد الإلكتروني غير صحيح، يرجى كتابته بشكل سليم 📧";
      }
      showToast(errorMsg, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAFF]">
        <div className="w-16 h-16 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin mb-4"></div>
        <p className="font-extrabold text-xl text-[#2D3748] animate-bounce-subtle">نحن نفتح بوابة سند السحرية... 🔑</p>
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

      <main className="flex-grow flex items-center justify-center py-16 px-4 relative overflow-hidden">
        
        {/* Playful Floating Circles */}
        <div className="absolute top-10 right-10 text-5xl opacity-15 animate-float-cloud">🎈</div>
        <div className="absolute bottom-10 left-10 text-5xl opacity-15 animate-float-cloud" style={{ animationDelay: '3.5s' }}>🍭</div>

        <div className="w-full max-w-md bg-white border-4 border-[#2D3748] rounded-[36px] shadow-kids p-6 md:p-8 relative z-10">
          
          {/* Header character */}
          <div className="text-center mb-6">
            <span className="text-5xl block mb-2 animate-bounce-subtle">🎒</span>
            <h2 className="text-3xl font-black text-[#2D3748]">
              {isLogin ? "دخول الأبطال" : "سجل لتصبح بطلاً"}
            </h2>
            <p className="text-sm font-bold text-gray-500 mt-1">
              {isLogin ? "أهلاً بك مجدداً في مساحتك الآمنة 🤝" : "انضم إلينا واجمع النجوم واشكي همومك ✨"}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#FCFAFF] border-3 border-[#2D3748] rounded-2xl p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setName("");
                setEmail("");
                setPassword("");
              }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                isLogin
                  ? "bg-[#9F7AEA] text-white border-2 border-[#2D3748] shadow-sm"
                  : "text-[#2D3748] hover:bg-gray-100"
              }`}
            >
              عضو مسجل 🤝
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setName("");
                setEmail("");
                setPassword("");
              }}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                !isLogin
                  ? "bg-[#63B3ED] text-white border-2 border-[#2D3748] shadow-sm"
                  : "text-[#2D3748] hover:bg-gray-100"
              }`}
            >
              صديق جديد 🎒
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold text-[#2D3748] text-sm flex items-center gap-1">
                  <User className="w-4 h-4 text-[#63B3ED]" />
                  <span>اسمك الجميل الرائع:</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: يوسف، فاطمة، أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-3 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#63B3ED] focus:border-[#63B3ED] focus:outline-none rounded-2xl font-bold text-sm transition-colors text-right"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-[#2D3748] text-sm flex items-center gap-1">
                <Mail className="w-4 h-4 text-[#9F7AEA]" />
                <span>البريد الإلكتروني (أو بريد والدك):</span>
              </label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#9F7AEA] focus:border-[#9F7AEA] focus:outline-none rounded-2xl font-bold text-sm transition-colors text-left dir-ltr"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-[#2D3748] text-sm flex items-center gap-1">
                <Lock className="w-4 h-4 text-[#FBB6CE]" />
                <span>كلمة المرور (سهلة التذكر):</span>
              </label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#FBB6CE] focus:border-[#FBB6CE] focus:outline-none rounded-2xl font-bold text-sm transition-colors text-left dir-ltr"
                required
              />
            </div>

            {/* Special note for kids */}
            <p className="text-[11px] font-bold text-gray-400 leading-relaxed text-center mt-1">
              🔒 معلوماتك سرية وآمنة تماماً ولا يتم مشاركتها مع أي شخص خارجي أبداً.
            </p>

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full py-4.5 mt-2 bg-[#68D391] text-white font-black text-lg rounded-2xl border-3 border-[#2D3748] shadow-kids shadow-kids-hover transition-all duration-300 hover:bg-[#48BB78] flex items-center justify-center gap-2 cursor-pointer ${
                authLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {authLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>يرجى الانتظار يا بطل...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "دخول مساحتي الخاصة 🔑" : "تسجيل وانطلاق 🚀"}</span>
                  <ArrowRight className="w-5 h-5 stroke-[3] rotate-180" />
                </>
              )}
            </button>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
