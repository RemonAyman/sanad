"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import CustomToast, { ToastType } from "@/components/CustomToast";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { Calendar, Clock, HelpCircle, Video, Star, Award, Heart, CheckCircle2, XCircle } from "lucide-react";

export default function BookingPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  // Form States
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [problemType, setProblemType] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Booking list history
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as ToastType });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Fetch child's bookings from Firestore
  const fetchBookings = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetched: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort in memory by date descending
      fetched.sort((a, b) => b.date.localeCompare(a.date));
      setBookings(fetched);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchBookings();
    }
  }, [user, profile]);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      showToast("من فضلك اختر تاريخاً ووصفاً مناسباً للقاء يا بطل! 📅⏰", "info");
      return;
    }

    if (!problemType) {
      showToast("من فضلك حدد نوع الموضوع الذي تريد التحدث عنه 🎯", "info");
      return;
    }

    setFormLoading(true);

    try {
      // 1. Write booking to database
      await addDoc(collection(db, "bookings"), {
        userId: user!.uid,
        childName: profile?.name || "بطل سند",
        date,
        time,
        problemType,
        status: "pending", // pending, approved, rejected
        zoomLink: "",
        createdAt: new Date(),
      });

      // 2. Reward stars (+5 stars for booking help bravely!)
      const userRef = doc(db, "users", user!.uid);
      const newStars = (profile?.stars || 0) + 5;
      
      const currentBadges = profile?.badges || [];
      const updatedBadges = [...currentBadges];
      if (!updatedBadges.includes("بطل شجاع 🌟")) {
        updatedBadges.push("بطل شجاع 🌟");
      }

      await updateDoc(userRef, {
        stars: newStars,
        badges: updatedBadges,
      });

      await refreshProfile();
      showToast("تم إرسال طلب لقاء زوم بنجاح! وحصلت على +5 نجوم! 🎥🌟", "success");
      
      setDate("");
      setTime("");
      setProblemType("");
      fetchBookings();
    } catch (err) {
      console.error("Booking error:", err);
      showToast("حدث خطأ في الإرسال، يرجى المحاولة لاحقاً 😢", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const topics = [
    { id: "bullying", label: "مضايقة الطلاب (تنمر) 😠" },
    { id: "loneliness", label: "الشعور بالوحدة 😢" },
    { id: "fear", label: "الخوف والقلق 😨" },
    { id: "study", label: "صعوبة المذاكرة والدراسة 📖" },
    { id: "family", label: "أشياء تضايقني بالمنزل 🏠" },
    { id: "general", label: "أريد فقط الفضفضة والتحدث 🤝" },
  ];

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAFF]">
        <div className="w-16 h-16 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin mb-4"></div>
        <p className="font-extrabold text-xl text-[#2D3748] animate-bounce-subtle">نفتح جدول مواعيد زوم الخاص بك... 📅🎬</p>
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

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Request history (shows up first in RTL prioritization) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <div className="bg-white border-4 border-[#2D3748] rounded-[32px] p-6 shadow-kids flex-grow">
            <h3 className="font-black text-2xl text-[#2D3748] mb-6 flex items-center gap-2 border-b-2 border-dashed border-gray-200 pb-3">
              <span>طلبات زوم السابقة 🎥</span>
              <span className="bg-[#9F7AEA] text-white text-xs px-2.5 py-0.5 rounded-full">
                {bookings.length}
              </span>
            </h3>

            {bookingsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <span className="text-6xl animate-bounce-subtle">🎬</span>
                <p className="font-bold text-gray-400 text-sm">لم تطلب أي لقاء زوم بعد يا بطل. تحدث معنا عندما تشاء!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">
                {bookings.map((book) => (
                  <div
                    key={book.id}
                    className="bg-[#FCFAFF] border-3 border-[#2D3748] p-5 rounded-[22px] shadow-sm relative flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-1 bg-white border-2 border-[#2D3748] rounded-xl">
                        {topics.find((t) => t.id === book.problemType)?.label || book.problemType}
                      </span>
                      
                      {/* Status pill */}
                      {book.status === "pending" ? (
                        <span className="px-2.5 py-1 bg-[#FEFCBF] text-[#744210] border-2 border-[#744210] rounded-xl text-xs font-black flex items-center gap-1">
                          <span>قيد الانتظار ⏳</span>
                        </span>
                      ) : book.status === "approved" ? (
                        <span className="px-2.5 py-1 bg-[#F0FFF4] text-[#22543D] border-2 border-[#22543D] rounded-xl text-xs font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم القبول! 🎉</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-[#FFF5F5] text-[#9B2C2C] border-2 border-[#9B2C2C] rounded-xl text-xs font-black flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>مرفوض 😢</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-extrabold text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#63B3ED]" />
                        <span>اليوم: {book.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#9F7AEA]" />
                        <span>الوقت: {book.time}</span>
                      </div>
                    </div>

                    {book.status === "approved" && book.zoomLink && (
                      <div className="mt-2 bg-[#EBF8FF] border-2 border-[#63B3ED] p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse-soft">
                        <span className="text-xs font-black text-[#2B6CB0]">لقاء زوم جاهز الآن يا بطل! 🎥🌟</span>
                        <a
                          href={book.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#3182CE] text-white font-black text-xs rounded-xl border-2 border-[#2D3748] shadow-sm hover:bg-[#2B6CB0] transition-colors"
                        >
                          دخول الاجتماع 🚀
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Booking Form */}
        <div className="lg:col-span-6">
          
          <div className="bg-white border-4 border-[#2D3748] rounded-[36px] p-6 md:p-8 shadow-kids flex flex-col gap-6">
            
            <div className="text-right flex flex-col gap-2">
              <h2 className="text-3xl font-black text-[#2D3748] flex items-center gap-2">
                <span>احجز لقاء زوم ودود 🎥</span>
                <span className="text-3xl animate-bounce-subtle">🌟</span>
              </h2>
              <p className="text-gray-500 font-bold">تحدث وجهاً لوجه عبر زوم مع أخصائي سند الذي سيسمعك بحب ويساعدك على حل المشكلة.</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="flex flex-col gap-5">
              
              {/* Problem Topic */}
              <div className="flex flex-col gap-2">
                <label className="font-extrabold text-base text-[#2D3748]">1. حدد الموضوع الذي تريد التحدث فيه:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setProblemType(topic.id)}
                      className={`p-3 rounded-xl border-2 font-extrabold text-right text-sm transition-all cursor-pointer ${
                        problemType === topic.id
                          ? "bg-[#9F7AEA] text-white border-[#2D3748]"
                          : "bg-[#FCFAFF] text-[#2D3748] border-gray-200 hover:border-[#9F7AEA]"
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date selection */}
              <div className="flex flex-col gap-2">
                <label className="font-extrabold text-base text-[#2D3748] flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-[#63B3ED]" />
                  <span>2. اختر تاريخ اللقاء المناسب لك:</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="px-4 py-3 bg-[#FCFAFF] border-3 border-gray-200 focus:border-[#63B3ED] focus:outline-none rounded-2xl font-bold text-sm text-right"
                  required
                />
              </div>

              {/* Time selection */}
              <div className="flex flex-col gap-2">
                <label className="font-extrabold text-base text-[#2D3748] flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-[#9F7AEA]" />
                  <span>3. اختر وقت اللقاء المناسب لك:</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-4 py-3 bg-[#FCFAFF] border-3 border-gray-200 focus:border-[#9F7AEA] focus:outline-none rounded-2xl font-bold text-sm text-right"
                  required
                />
              </div>

              <div className="bg-[#FAF5FF] border-2 border-[#9F7AEA] p-4 rounded-2xl flex items-start gap-2.5">
                <span className="text-xl">🏆</span>
                <p className="text-xs font-black text-[#553C9A] leading-relaxed">
                  بمجرد إرسال طلبك، سيقوم المشرف بمراجعته والموافقة عليه فوراً وإرسال رابط زوم لتفتحه من غرفتك. شجاعتك في طلب المساعدة سريعة ورائعة!
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formLoading}
                className={`w-full py-4.5 bg-[#68D391] text-white font-black text-xl rounded-2xl border-4 border-[#2D3748] shadow-kids shadow-kids-hover hover:bg-[#48BB78] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  formLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {formLoading ? (
                  <>
                    <div className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin"></div>
                    <span>جاري إرسال حجز موعد زوم...</span>
                  </>
                ) : (
                  <>
                    <span>احجز اللقاء السعيد الآن 🎥🚀</span>
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
