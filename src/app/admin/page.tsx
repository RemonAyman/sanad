"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import CustomToast, { ToastType } from "@/components/CustomToast";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";
import {
  MessageSquare,
  AlertTriangle,
  Video,
  Film,
  Award,
  CheckCircle,
  XCircle,
  Play,
  Trash2,
  Send,
  Shield,
  Eye,
  Plus,
  ChevronDown
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Selected Admin Active Tab
  const [activeTab, setActiveTab] = useState<"chats" | "reports" | "bookings" | "videos" | "talents">("reports");

  // Database States
  const [reports, setReports] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]); // Unique children who messaged

  // Live Chat Console States
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");

  // Inline replies for child reports
  const [reportReplies, setReportReplies] = useState<Record<string, string>>({});

  // Form states for adding video
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoCategory, setNewVideoCategory] = useState("anti-bullying");
  const [newVideoYoutubeId, setNewVideoYoutubeId] = useState("");

  // Loading States
  const [dbLoading, setDbLoading] = useState(true);

  // Zoom Meeting Booking Link States
  const [zoomLinks, setZoomLinks] = useState<Record<string, string>>({});

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as ToastType });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
  };

  // 1. Guard route: redirect if not admin
  useEffect(() => {
    if (!loading) {
      if (!user || !profile || profile.role !== "admin") {
        router.push("/admin/login");
      }
    }
  }, [user, profile, loading, router]);

  // 2. Fetch all collections in Realtime / Snapshot
  const fetchAllData = async () => {
    if (!user || profile?.role !== "admin") return;

    try {
      // Listen to Reports
      onSnapshot(collection(db, "reports"), (snap) => {
        const reps: any[] = [];
        snap.forEach((d) => reps.push({ id: d.id, ...d.data() }));
        reps.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setReports(reps);
      }, (err) => {
        console.warn("Firestore reports permission denied (check security rules):", err);
      });

      // Listen to Bookings
      onSnapshot(collection(db, "bookings"), (snap) => {
        const books: any[] = [];
        snap.forEach((d) => books.push({ id: d.id, ...d.data() }));
        books.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setBookings(books);
      }, (err) => {
        console.warn("Firestore bookings permission denied (check security rules):", err);
      });

      // Listen to Talents
      onSnapshot(collection(db, "talents"), (snap) => {
        const tals: any[] = [];
        snap.forEach((d) => tals.push({ id: d.id, ...d.data() }));
        tals.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setTalents(tals);
      }, (err) => {
        console.warn("Firestore talents permission denied (check security rules):", err);
      });

      // Listen to Videos
      onSnapshot(collection(db, "videos"), (snap) => {
        const vids: any[] = [];
        snap.forEach((d) => vids.push({ id: d.id, ...d.data() }));
        setVideos(vids);
      }, (err) => {
        console.warn("Firestore videos permission denied (check security rules):", err);
      });

      // Listen to Messages to map active users list
      onSnapshot(collection(db, "messages"), (snap) => {
        const allMsgs: any[] = [];
        snap.forEach((d) => allMsgs.push({ id: d.id, ...d.data() }));

        // Filter unique user IDs that sent a message
        const uniqueUsersMap: Record<string, { userId: string; childName: string; lastMessage: string; lastTime: any }> = {};
        allMsgs.forEach((m) => {
          if (m.userId) {
            uniqueUsersMap[m.userId] = {
              userId: m.userId,
              childName: m.childName || "بطل سند",
              lastMessage: m.text || "مرفق وسائط 📁",
              lastTime: m.createdAt,
            };
          }
        });
        
        const sortedChatUsers = Object.values(uniqueUsersMap).sort(
          (a: any, b: any) => (b.lastTime?.seconds || 0) - (a.lastTime?.seconds || 0)
        );
        setChatUsers(sortedChatUsers);
      }, (err) => {
        console.warn("Firestore messages list permission denied (check security rules):", err);
      });

      setDbLoading(false);
    } catch (err) {
      console.error(err);
      showToast("خطأ أثناء تحميل البيانات من قاعدة البيانات 😢", "error");
    }
  };

  useEffect(() => {
    if (user && profile && profile.role === "admin") {
      fetchAllData();
    }
  }, [user, profile]);

  // 3. Live Chat Subscriptions
  useEffect(() => {
    if (!selectedChatUserId) return;

    const q = query(
      collection(db, "messages"),
      where("userId", "==", selectedChatUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((d) => msgs.push({ id: d.id, ...d.data() }));
      msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setActiveChatMessages(msgs);
    }, (err) => {
      console.warn("Firestore active chat messages permission denied (check security rules):", err);
    });

    return () => unsubscribe();
  }, [selectedChatUserId]);

  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatUserId) return;

    try {
      await addDoc(collection(db, "messages"), {
        userId: selectedChatUserId,
        sender: "admin",
        childName: "المشرف المتخصص",
        text: replyText.trim(),
        imageUrl: "",
        voiceUrl: "",
        createdAt: new Date(),
      });
      setReplyText("");
    } catch (err) {
      console.error(err);
      showToast("فشل إرسال الرد في الدردشة 😢", "error");
    }
  };

  // 4. Report reply handling
  const handleSendReportReply = async (reportId: string, userId: string) => {
    const reply = reportReplies[reportId];
    if (!reply?.trim()) {
      showToast("يرجى كتابة الرد أولاً لمساعدة الطفل ✍️", "info");
      return;
    }

    try {
      // Update report doc with reply and status = resolved/answered
      await updateDoc(doc(db, "reports", reportId), {
        adminReply: reply.trim(),
        status: "answered",
      });

      showToast("تم إرسال ردك التربوي للطفل بنجاح! 🌟❤️", "success");
      setReportReplies({ ...reportReplies, [reportId]: "" });
    } catch (err) {
      console.error(err);
      showToast("فشل إرسال الرد 😢", "error");
    }
  };

  // 5. Booking Actions
  const handleApproveBooking = async (bookingId: string) => {
    const link = zoomLinks[bookingId];
    if (!link?.trim()) {
      showToast("يرجى كتابة رابط لقاء زوم أولاً للموافقة 🎥🔗", "info");
      return;
    }

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "approved",
        zoomLink: link.trim(),
      });
      showToast("تمت الموافقة على اللقاء وإرسال رابط زوم! 🎉🎥", "success");
      setZoomLinks({ ...zoomLinks, [bookingId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "rejected",
      });
      showToast("تم رفض اللقاء وتعديل الحالة ❌", "info");
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Educational Videos CRUD
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoYoutubeId.trim()) {
      showToast("أدخل عنوان الفيديو ومعرف يوتيوب 🎬", "error");
      return;
    }

    try {
      await addDoc(collection(db, "videos"), {
        title: newVideoTitle.trim(),
        category: newVideoCategory,
        youtubeId: newVideoYoutubeId.trim(),
        createdAt: new Date(),
        description: "فيديو مضاف من قبل الإدارة لمساعدة الأبطال.",
      });

      showToast("تمت إضافة الفيديو التعليمي الجديد بنجاح! 🍿✨", "success");
      setNewVideoTitle("");
      setNewVideoYoutubeId("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      showToast("تم حذف الفيديو من المكتبة بنجاح 🗑️", "success");
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Talents Moderation
  const handleApproveTalent = async (talentId: string) => {
    try {
      await updateDoc(doc(db, "talents", talentId), {
        approved: true,
      });
      showToast("تمت الموافقة بنجاح ونشر الموهبة في المعرض! 🎨🎉", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTalent = async (talentId: string) => {
    try {
      await deleteDoc(doc(db, "talents", talentId));
      showToast("تم حذف الموهبة المرفوعة نهائياً 🗑️", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const categoriesText: Record<string, string> = {
    bullying: "التنمر المدرسي 😠",
    violence: "العنف والأذى 😰",
    fear: "الخوف والقلق 😨",
    isolation: "الوحدة والعزلة 😢",
    family: "المشاكل الأسرية 🏠",
    study: "صعوبة الدراسة 📖",
  };

  if (loading || !profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAFF]">
        <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-transparent animate-spin mb-4"></div>
        <p className="font-extrabold text-lg text-gray-700">جاري تسجيل دخول لوحة الإشراف الأمنية... 🔐🛡️</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <CustomToast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full flex flex-col gap-6">
        
        {/* Admin Header Title */}
        <div className="bg-white border-4 border-gray-800 rounded-[32px] p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500 fill-blue-50 animate-pulse" />
              <span>لوحة تحكم مشرفي سند 🛡️</span>
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1">تابع مشكلات الأطفال، دردش معهم، ووافق على طلبات زوم ومعارض المواهب.</p>
          </div>
          <div className="px-5 py-2.5 bg-gray-800 text-white rounded-2xl border-2 border-gray-900 font-extrabold text-sm shadow-sm">
            مشرف نشط: {profile.name} 👮
          </div>
        </div>

        {/* Dashboard Statistics Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#FFF5F5] border-3 border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-2xl font-black text-gray-800">{reports.filter((r) => r.status === "pending").length}</span>
              <span className="text-xs font-bold text-gray-500 mt-0.5">بلاغات قيد الانتظار ⏳</span>
            </div>
            <span className="text-3xl">😠</span>
          </div>

          <div className="bg-[#FEFCBF] border-3 border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-2xl font-black text-gray-800">{bookings.filter((b) => b.status === "pending").length}</span>
              <span className="text-xs font-bold text-gray-500 mt-0.5">جلسات زوم معلقة 🎥</span>
            </div>
            <span className="text-3xl">📽️</span>
          </div>

          <div className="bg-[#EBF8FF] border-3 border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-2xl font-black text-gray-800">{talents.filter((t) => !t.approved).length}</span>
              <span className="text-xs font-bold text-gray-500 mt-0.5">مواهب تنتظر النشر 🎨</span>
            </div>
            <span className="text-3xl">🌟</span>
          </div>

          <div className="bg-[#F0FFF4] border-3 border-gray-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col text-right">
              <span className="text-2xl font-black text-gray-800">{chatUsers.length}</span>
              <span className="text-xs font-bold text-gray-500 mt-0.5">محادثات دردشة نشطة 💬</span>
            </div>
            <span className="text-3xl">🤝</span>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2.5 border-b-4 border-gray-800 pb-3">
          {(["reports", "chats", "bookings", "talents", "videos"] as const).map((tab) => {
            const labels = {
              reports: "بلاغات المشاكل 🎒",
              chats: "محادثات الدردشة 💬",
              bookings: "حجوزات زوم 🎥",
              talents: "مراجعة المواهب 🎨",
              videos: "مكتبة الفيديوهات 🎬",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 rounded-2xl border-3 font-extrabold text-sm transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-gray-800 text-white border-gray-900 scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* LOADING DATABASE INDICATOR */}
        {dbLoading ? (
          <div className="py-24 flex justify-center bg-white border-4 border-gray-800 rounded-[32px]">
            <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white border-4 border-gray-800 rounded-[32px] p-6 shadow-lg min-h-[450px]">
            
            {/* TAB 1: REPORTS */}
            {activeTab === "reports" && (
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-black text-gray-800 text-right">مشكلات وبلاغات الأطفال المستلمة:</h3>
                {reports.length === 0 ? (
                  <p className="text-center text-gray-400 font-bold py-16">لم يستلم أي بلاغ مشاكل من الأطفال بعد! 🎉</p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-gray-50 border-3 border-gray-800 p-5 rounded-2xl flex flex-col gap-4 text-right shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-gray-200 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">👦</span>
                            <span className="font-extrabold text-base text-gray-800">{rep.childName}</span>
                            <span className="text-xs bg-[#FAF5FF] border border-gray-300 px-2 py-0.5 rounded font-black">
                              إيموجي اليوم: {rep.mood}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-100 text-red-600 border border-red-400 font-black text-xs rounded-xl">
                              المشكلة: {categoriesText[rep.category] || rep.category}
                            </span>
                            <span className="text-xs font-bold text-gray-400">
                              {rep.createdAt?.seconds ? new Date(rep.createdAt.seconds * 1000).toLocaleString("ar-EG") : "اليوم"}
                            </span>
                          </div>
                        </div>

                        {rep.text && (
                          <div className="bg-white p-4 rounded-xl border border-gray-300">
                            <p className="font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">{rep.text}</p>
                          </div>
                        )}

                        {/* Image attached */}
                        {rep.imageUrl && (
                          <div className="self-start rounded-xl overflow-hidden border-2 border-gray-800 max-w-xs shadow-sm bg-white p-1">
                            <img src={rep.imageUrl} alt="مرفق بلاغ" className="w-full h-auto object-cover rounded-lg" />
                          </div>
                        )}

                        {/* Voice note attached */}
                        {rep.voiceUrl && (
                          <div className="self-start bg-[#F0FFF4] border border-[#68D391] p-3 rounded-2xl flex items-center gap-2">
                            <span className="text-xs font-black text-[#2D3748]">رسالة صوتية مسجلة: 🎙️</span>
                            <audio src={rep.voiceUrl} controls className="h-8 max-w-[200px]" />
                          </div>
                        )}

                        {/* Reply editor */}
                        <div className="border-t border-dashed border-gray-200 pt-4 flex flex-col gap-3">
                          {rep.adminReply ? (
                            <div className="bg-green-50 border border-green-300 p-3.5 rounded-xl">
                              <span className="font-black text-xs text-green-700 block mb-1">ردك السحري المرسل للطفل:</span>
                              <p className="font-extrabold text-sm text-gray-700">{rep.adminReply}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <span className="font-extrabold text-sm text-gray-600">اكتب رداً تربوياً داعماً يظهر في لوحة الطفل:</span>
                              <div className="flex gap-2">
                                <textarea
                                  placeholder="اكتب رداً داعماً وودوداً للطفل يعلمه أنه ليس وحده وأنك ستتحدث معه لحل كل شيء..."
                                  value={reportReplies[rep.id] || ""}
                                  onChange={(e) => setReportReplies({ ...reportReplies, [rep.id]: e.target.value })}
                                  rows={2}
                                  className="flex-grow px-4 py-2 border-2 border-gray-300 focus:border-gray-800 focus:outline-none rounded-xl font-bold text-sm text-right resize-none"
                                />
                                <button
                                  onClick={() => handleSendReportReply(rep.id, rep.userId)}
                                  className="px-6 bg-[#68D391] text-white border-2 border-gray-800 rounded-xl font-black text-sm hover:bg-[#48BB78] transition-colors flex items-center justify-center cursor-pointer"
                                >
                                  إرسال الرد
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CHATS CONSOLE */}
            {activeTab === "chats" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
                
                {/* Chat users sidebar */}
                <div className="lg:col-span-4 border-2 border-gray-200 rounded-2xl p-4 flex flex-col gap-3 h-[420px] overflow-y-auto">
                  <h4 className="font-black text-sm text-gray-700 border-b pb-2 text-right">أطفال أرسلوا رسائل 💬</h4>
                  {chatUsers.length === 0 ? (
                    <p className="text-center text-gray-400 font-bold text-xs py-8">لا توجد محادثات نشطة حالياً</p>
                  ) : (
                    chatUsers.map((cu) => (
                      <button
                        key={cu.userId}
                        onClick={() => setSelectedChatUserId(cu.userId)}
                        className={`w-full p-3 rounded-xl border-2 text-right transition-all flex items-center justify-between cursor-pointer ${
                          selectedChatUserId === cu.userId
                            ? "bg-gray-800 text-white border-gray-900"
                            : "bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👦</span>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-xs">{cu.childName}</span>
                            <span className={`text-[9px] truncate max-w-[120px] ${selectedChatUserId === cu.userId ? "text-gray-300" : "text-gray-400"}`}>
                              {cu.lastMessage}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 rotate-90" />
                      </button>
                    ))
                  )}
                </div>

                {/* Chat window */}
                <div className="lg:col-span-8 border-2 border-gray-200 rounded-2xl p-4 flex flex-col justify-between h-[420px] relative">
                  {selectedChatUserId ? (
                    <>
                      {/* Active messages log */}
                      <div className="flex-grow overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
                        {activeChatMessages.map((msg) => {
                          const isAdminSender = msg.sender === "admin";
                          const isAi = msg.sender === "ai";
                          
                          return (
                            <div
                              key={msg.id}
                              className={`flex gap-2 max-w-[80%] ${isAdminSender ? "mr-auto flex-row-reverse" : "ml-auto"}`}
                            >
                              <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 flex-shrink-0 flex items-center justify-center text-xs">
                                {isAdminSender ? "👮" : isAi ? "🧸" : "👦"}
                              </div>
                              <div
                                className={`p-3 rounded-2xl border text-xs font-extrabold text-right shadow-sm ${
                                  isAdminSender
                                    ? "bg-gray-800 border-gray-950 text-white rounded-tr-none"
                                    : isAi
                                    ? "bg-purple-50 border-purple-300 text-purple-800 rounded-tl-none"
                                    : "bg-blue-50 border-blue-300 text-blue-800 rounded-tl-none"
                                }`}
                              >
                                <span className="block text-[9px] opacity-75 mb-0.5">
                                  {isAdminSender ? "أنا (المشرف)" : isAi ? "مساعد سند (الرد الآلي)" : msg.childName}
                                </span>
                                {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                                {msg.imageUrl && <img src={msg.imageUrl} className="mt-1 rounded-lg max-w-[150px] border border-gray-300" />}
                                {msg.voiceUrl && <audio src={msg.voiceUrl} controls className="h-6 mt-1 max-w-[160px]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply input form */}
                      <form onSubmit={handleSendChatReply} className="flex gap-2 border-t pt-3">
                        <input
                          type="text"
                          placeholder="اكتب رداً دافئاً ومريحاً للطفل..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-grow px-3 py-3 bg-gray-50 border-2 border-gray-350 focus:border-gray-800 focus:outline-none rounded-xl font-bold text-xs text-right"
                        />
                        <button
                          type="submit"
                          className="px-4.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl border border-gray-950 font-black text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>أرسل</span>
                          <Send className="w-3.5 h-3.5 rotate-180 fill-white" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="my-auto text-center flex flex-col items-center gap-3">
                      <span className="text-5xl animate-bounce-subtle">💬</span>
                      <p className="font-bold text-gray-400 text-sm">حدد محادثة طفل من الشريط الجانبي لبدء الحديث المباشر والآمن!</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="flex flex-col gap-6 text-right">
                <h3 className="text-xl font-black text-gray-800">حجوزات لقاءات زوم لتقديم المشورة:</h3>
                {bookings.length === 0 ? (
                  <p className="text-center text-gray-400 font-bold py-16">لا توجد أي حجوزات لقاءات زوم مسجلة</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {bookings.map((book) => (
                      <div
                        key={book.id}
                        className="bg-gray-50 border-3 border-gray-800 p-5 rounded-2xl flex flex-col gap-3 relative shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm bg-white border border-gray-300 px-3 py-0.5 rounded-lg">
                            الطفل: {book.childName} 👦
                          </span>
                          
                          {book.status === "pending" ? (
                            <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded-lg text-xs font-black">
                              قيد المراجعة ⏳
                            </span>
                          ) : book.status === "approved" ? (
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded-lg text-xs font-black">
                              تم القبول والموافقة! 🎉
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 border border-red-400 rounded-lg text-xs font-black">
                              مرفوض ❌
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-extrabold text-gray-500 mt-2">
                          <span>الموعد: {book.date}</span>
                          <span>الوقت: {book.time}</span>
                          <span>سبب اللقاء: {categoriesText[book.problemType] || book.problemType}</span>
                        </div>

                        {/* Approved Link display or Booking approval tool */}
                        {book.status === "approved" ? (
                          <div className="bg-green-50 border border-green-300 p-3 rounded-xl mt-3 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-green-700">الرابط المعتمد: {book.zoomLink}</span>
                            <a href={book.zoomLink} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-blue-500 hover:underline">
                              معاينة الرابط 🌐
                            </a>
                          </div>
                        ) : book.status === "pending" ? (
                          <div className="border-t border-dashed border-gray-200 pt-3 mt-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                            <div className="flex-grow flex items-center gap-2">
                              <span className="text-xs font-extrabold text-gray-500 flex-shrink-0">أدخل رابط زوم للموافقة:</span>
                              <input
                                type="text"
                                placeholder="https://zoom.us/j/123456789"
                                value={zoomLinks[book.id] || ""}
                                onChange={(e) => setZoomLinks({ ...zoomLinks, [book.id]: e.target.value })}
                                className="flex-grow px-3 py-1.5 border border-gray-300 rounded-xl font-bold text-xs text-left dir-ltr"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveBooking(book.id)}
                                className="px-4 py-2 bg-green-500 text-white font-extrabold text-xs rounded-xl border border-green-600 hover:bg-green-600 transition-colors cursor-pointer"
                              >
                                قبول الموعد 🎥
                              </button>
                              <button
                                onClick={() => handleRejectBooking(book.id)}
                                className="px-4 py-2 bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200 hover:bg-red-200 transition-colors cursor-pointer"
                              >
                                رفض ❌
                              </button>
                            </div>
                          </div>
                        ) : null}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VIDEOS LIBRARY */}
            {activeTab === "videos" && (
              <div className="flex flex-col gap-6 text-right">
                
                {/* Form to Add New Video */}
                <div className="bg-gray-50 border-3 border-gray-800 p-5 rounded-2xl shadow-sm">
                  <h4 className="font-black text-lg text-gray-800 mb-4 flex items-center gap-1.5 justify-start">
                    <Plus className="w-5 h-5" />
                    <span>إضافة فيديو تعليمي جديد للمكتبة:</span>
                  </h4>
                  <form onSubmit={handleAddVideo} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="font-extrabold text-xs text-gray-600">عنوان الفيديو:</label>
                      <input
                        type="text"
                        placeholder="مثال: كيف تقوي ثقتك بنفسك وتكون بطلاً"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-xs text-right"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-extrabold text-xs text-gray-600">الفئة:</label>
                      <select
                        value={newVideoCategory}
                        onChange={(e) => setNewVideoCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-xs text-right"
                      >
                        <option value="anti-bullying">مواجهة التنمر 🛡️</option>
                        <option value="confidence">الثقة بالنفس 🌟</option>
                        <option value="respect">الاحترام 🤝</option>
                        <option value="anger-control">التحكم في الغضب 🕊️</option>
                        <option value="friendship">الصداقة الجميلة 🧸</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-extrabold text-xs text-gray-600">معرف يوتيوب (ID):</label>
                      <input
                        type="text"
                        placeholder="مثال: pew8c2Z19l0"
                        value={newVideoYoutubeId}
                        onChange={(e) => setNewVideoYoutubeId(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-xs text-left dir-ltr"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-500 text-white border-2 border-gray-800 rounded-xl font-black text-xs hover:bg-blue-600 transition-colors cursor-pointer col-span-1 sm:col-span-4 self-center mt-2"
                    >
                      تأكيد إضافة الفيديو للمكتبة 🍿🚀
                    </button>
                  </form>
                </div>

                {/* Library list and delete actions */}
                <h4 className="font-black text-lg text-gray-800 mt-4">الفيديوهات النشطة في المكتبة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {videos.map((vid) => (
                    <div
                      key={vid.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-gray-50 border border-gray-200 rounded self-start">
                          {vid.category}
                        </span>
                        <h5 className="font-black text-sm text-gray-700 leading-snug">{vid.title}</h5>
                        <p className="text-[10px] font-bold text-gray-400">معرف يوتيوب: {vid.youtubeId}</p>
                      </div>

                      <div className="flex justify-between items-center mt-4 border-t pt-2.5">
                        <span className="text-[10px] font-bold text-green-500">نشط في المكتبة 🍿</span>
                        {/* Avoid deleting default seed videos if they have seed ID */}
                        {!vid.id.startsWith("seed-") && (
                          <button
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-200 cursor-pointer"
                            title="حذف الفيديو"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 5: TALENTS REVIEW */}
            {activeTab === "talents" && (
              <div className="flex flex-col gap-6 text-right">
                <h3 className="text-xl font-black text-gray-800">مراجعة منشورات إبداع ومواهب الأطفال:</h3>
                {talents.length === 0 ? (
                  <p className="text-center text-gray-400 font-bold py-16">لا توجد منشورات مواهب حالياً</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {talents.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 border-3 border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm p-4 gap-4"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <span className="font-extrabold text-xs text-gray-700">{item.childName}</span>
                            <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-black text-gray-500">
                              نوع الموهبة: {item.type}
                            </span>
                          </div>

                          <h4 className="font-black text-base text-gray-800 mb-2">{item.title}</h4>

                          {/* Drawing preview */}
                          {item.type === "drawing" && item.contentUrl && (
                            <img src={item.contentUrl} alt="رسمة" className="w-full h-36 object-contain bg-white rounded-lg border border-gray-300 p-1" />
                          )}

                          {/* Video talent */}
                          {item.type === "video" && item.contentUrl && (
                            <video src={item.contentUrl} controls className="w-full h-36 object-cover bg-black rounded-lg" />
                          )}

                          {/* Story writing */}
                          {item.type === "story" && item.storyText && (
                            <div className="bg-[#FFF9E6] border border-[#F6E05E] p-3 rounded-lg max-h-36 overflow-y-auto text-xs font-bold text-[#5B3E03] whitespace-pre-wrap">
                              {item.storyText}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between gap-3 border-t pt-3.5">
                          {item.approved ? (
                            <span className="text-xs font-black text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>منشور في المعرض 🎨🎉</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveTalent(item.id)}
                              className="px-4 py-2 bg-green-500 text-white font-extrabold text-xs rounded-xl border border-green-600 hover:bg-green-600 transition-all cursor-pointer flex-grow text-center"
                            >
                              موافقة ونشر في المعرض 🏆
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTalent(item.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200 hover:bg-red-200 transition-all cursor-pointer flex-shrink-0"
                            title="حذف المنشور"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
