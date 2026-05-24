"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import CustomToast, { ToastType } from "@/components/CustomToast";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { uploadFile } from "@/lib/cloudinary";
import { Star, Smile, Mic, Square, Trash2, Image, Video, Award, Calendar, Heart, ShieldAlert, Send } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  // Mood State
  const [mood, setMood] = useState<"😊" | "😢" | "😡" | "😨" | "">("");
  const [moodFeedback, setMoodFeedback] = useState("");

  // Form States
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // File Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceURL, setVoiceURL] = useState<string | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // User Reports History
  const [reports, setReports] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Toast State
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

  // Load history from Firestore
  const fetchReports = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "reports"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetched: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort in memory by createdAt descending
      fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReports(fetched);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchReports();
    }
  }, [user, profile]);

  // Audio Recorder logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setVoiceBlob(blob);
        setVoiceURL(URL.createObjectURL(blob));
        // Stop all tracks in stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      showToast("بدأ تسجيل الصوت... تحدث براحتك يا بطل! 🎙️", "info");
    } catch (err) {
      console.error("Could not start recording:", err);
      showToast("يرجى إعطاء متصفحك صلاحية الميكروفون للتسجيل 🎙️", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setVoiceBlob(null);
    setVoiceURL(null);
    showToast("تم حذف التسجيل الصوتي 🗑️", "info");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Mood selections
  const handleMoodSelect = (selected: "😊" | "😢" | "😡" | "😨") => {
    setMood(selected);
    const feedback: Record<string, string> = {
      "😊": "كم أنا سعيد برؤية ابتسامتك الرائعة! حافظ على إشراقك دائماً يا بطل! 🌟",
      "😢": "لا تبكِ يا صديقي العزيز، نحن معك دائماً وسنساعدك لتشعر بالفرحة مجدداً ❤️",
      "😡": "لا بأس بالغضب، الغضب يزول مع التحدث والهدوء. خذ نفساً عميقاً معنا 🕊️",
      "😨": "الخوف طبيعي. نحن هنا لنمسك يدك ولن نتركك أبداً لوحدك. أنت في أمان 🛡️",
    };
    setMoodFeedback(feedback[selected]);
  };

  const resetForm = () => {
    setCategory("");
    setText("");
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    setVoiceBlob(null);
    setVoiceURL(null);
    setMood("");
    setMoodFeedback("");
  };

  // Submit Report to Firestore & Cloudinary
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mood) {
      showToast("من فضلك اختر إيموجي يعبر عن شعورك اليوم أولاً 😊", "info");
      return;
    }

    if (!category) {
      showToast("من فضلك اختر نوع المشكلة لمساعدتك بشكل أفضل 🎯", "info");
      return;
    }

    if (!text && !voiceBlob) {
      showToast("اكتب مشكلتك أو سجلها بصوتك الرائع ليتحدث معك المشرف ✍️🎙️", "info");
      return;
    }

    setFormLoading(true);
    showToast("جاري إرسال مشكلتك بأمان وسرية... 🚀", "info");

    try {
      let uploadedImageUrl = "";
      let uploadedVideoUrl = "";
      let uploadedVoiceUrl = "";

      // 1. Upload files
      if (imageFile) {
        const res = await uploadFile(imageFile, "image");
        uploadedImageUrl = res.url;
      }
      if (videoFile) {
        const res = await uploadFile(videoFile, "video");
        uploadedVideoUrl = res.url;
      }
      if (voiceBlob) {
        const res = await uploadFile(voiceBlob, "raw");
        uploadedVoiceUrl = res.url;
      }

      // 2. Write Report doc
      await addDoc(collection(db, "reports"), {
        userId: user!.uid,
        childName: profile?.name || "بطل سند",
        mood,
        category,
        text: text.trim(),
        imageUrl: uploadedImageUrl,
        videoUrl: uploadedVideoUrl,
        voiceUrl: uploadedVoiceUrl,
        createdAt: new Date(),
        status: "pending", // pending, answered, resolved
        adminReply: "",
      });

      // 3. Reward Stars & Refresh User profile
      const userRef = doc(db, "users", user!.uid);
      const newStars = (profile?.stars || 0) + 10; // 10 stars reward for reporting a problem bravely!
      
      // Add a bravery badge if they don't have it
      const currentBadges = profile?.badges || [];
      const updatedBadges = [...currentBadges];
      if (!updatedBadges.includes("طفل شجاع 🌟")) {
        updatedBadges.push("طفل شجاع 🌟");
      }

      await updateDoc(userRef, {
        stars: newStars,
        badges: updatedBadges,
      });

      await refreshProfile();
      showToast("تم الإرسال بنجاح! وحصلت على +10 نجوم لشجاعتك! ⭐🏆", "success");
      resetForm();
      fetchReports();
    } catch (err) {
      console.error("Error submitting report:", err);
      showToast("حدث خطأ في الإرسال، يرجى إعادة المحاولة 😢", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const categories = [
    { id: "bullying", name: "التنمر المدرسي 😠", desc: "أشخاص يضايقونني في المدرسة" },
    { id: "violence", name: "العنف والأذى 😰", desc: "أتعرض للضرب أو القسوة" },
    { id: "fear", name: "الخوف والقلق 😨", desc: "أشعر بالخوف من أشياء معينة" },
    { id: "isolation", name: "الوحدة والعزلة 😢", desc: "ليس لدي أصدقاء وأشعر بالانفراد" },
    { id: "family", name: "المشاكل الأسرية 🏠", desc: "أشياء تضايقني داخل البيت" },
    { id: "study", name: "صعوبات الدراسة 📖", desc: "أواجه ضغوطات في الفهم والمذاكرة" },
  ];

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAFF]">
        <div className="w-16 h-16 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin mb-4"></div>
        <p className="font-extrabold text-xl text-[#2D3748] animate-bounce-subtle">جاري تحضير غرفتك الخاصة السعيدة... 🎈</p>
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
        
        {/* RIGHT COLUMN: Child Profile Card & History (RTL priority layout) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Child Scorecard */}
          <div className="bg-white border-4 border-[#2D3748] rounded-[32px] p-6 shadow-kids relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-[#FEFCBF] rounded-full opacity-30"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#FBB6CE] border-3 border-[#2D3748] flex items-center justify-center text-4xl shadow-sm">
                👦
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-[#2D3748]">{profile.name}</span>
                <span className="text-xs font-black text-gray-400 mt-0.5">صديق سند المفضل 🤝</span>
              </div>
            </div>

            {/* Stars score */}
            <div className="bg-[#FEFCBF] border-3 border-[#2D3748] rounded-2xl p-4 flex items-center justify-between mb-4 shadow-sm">
              <span className="font-black text-lg text-[#744210]">نجومي اللامعة:</span>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-[#F6E05E] fill-[#F6E05E] animate-bounce-subtle" />
                <span className="font-black text-2xl text-[#2D3748]">{profile.stars}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-2">
              <span className="font-black text-sm text-gray-500">أوسمتي الذهبية 🏆</span>
              <div className="flex flex-wrap gap-2">
                {profile.badges && profile.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-[#EBF8FF] text-[#2B6CB0] font-extrabold text-xs rounded-full border-2 border-[#2D3748] shadow-sm flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5 fill-[#2B6CB0] stroke-white" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* User Reports list */}
          <div className="bg-white border-4 border-[#2D3748] rounded-[32px] p-6 shadow-kids flex-grow">
            <h3 className="font-black text-xl text-[#2D3748] mb-4 flex items-center gap-2 border-b-2 border-dashed border-gray-200 pb-3">
              <span>مشكلاتي المرسلة 🎒</span>
              <span className="bg-[#9F7AEA] text-white text-xs px-2 py-0.5 rounded-full">
                {reports.length}
              </span>
            </h3>

            {historyLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 rounded-full border-3 border-[#9F7AEA] border-t-transparent animate-spin"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <span className="text-4xl">🕊️</span>
                <p className="font-bold text-gray-400 text-sm">لم تسجل أي مشاكل بعد يا بطل. مساحتك نظيفة وسعيدة!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-1">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-gray-50 border-3 border-[#2D3748] p-4 rounded-2xl flex flex-col gap-2 relative shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2 py-0.5 bg-white border border-[#2D3748] rounded-lg">
                        {categories.find((c) => c.id === rep.category)?.name || rep.category}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rep.createdAt?.seconds ? new Date(rep.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "اليوم"}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-gray-500 line-clamp-2">{rep.text || "رسالة صوتية 🎙️"}</p>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-gray-200">
                      <span className="text-xs font-black">حالة المشكلة:</span>
                      {rep.status === "pending" ? (
                        <span className="px-2 py-0.5 bg-[#FEFCBF] text-[#744210] border border-[#744210] rounded-lg text-[10px] font-black">
                          قيد الانتظار ⏳
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#FAF5FF] text-[#9F7AEA] border border-[#9F7AEA] rounded-lg text-[10px] font-black animate-pulse-soft">
                          تم الرد عليها! 💬🌟
                        </span>
                      )}
                    </div>

                    {rep.adminReply && (
                      <div className="bg-[#FAF5FF] border-2 border-[#9F7AEA] p-2.5 rounded-xl text-xs font-extrabold text-[#2D3748] mt-2 relative">
                        <span className="absolute -top-3 right-4 bg-[#9F7AEA] text-white px-1.5 py-0.2 rounded text-[8px]">رد المشرف</span>
                        <p className="mt-1">{rep.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* LEFT COLUMN: Main Form Entry */}
        <div className="lg:col-span-8">
          
          <div className="bg-white border-4 border-[#2D3748] rounded-[36px] p-6 md:p-8 shadow-kids flex flex-col gap-6">
            
            <div className="flex flex-col gap-2 text-right">
              <h2 className="text-3xl font-black text-[#2D3748] flex items-center gap-2">
                <span>احكي ما يضايقك يا بطل! 🤝</span>
                <Heart className="w-8 h-8 fill-red-400 stroke-red-400 animate-pulse-soft" />
              </h2>
              <p className="text-gray-500 font-bold">كل شيء تكتبه هنا سرى ولن يراه سوى أخصائي سند الودود لمساعدتك وحل المشكلة.</p>
            </div>

            {/* Mood selector inside form */}
            <div className="bg-[#FCFAFF] border-3 border-[#2D3748] p-4 rounded-3xl text-right">
              <span className="font-extrabold text-base text-[#2D3748] block mb-3">1. ما هو شعورك الداخلي الآن؟ 😊</span>
              <div className="flex justify-start gap-4">
                {(["😊", "😢", "😡", "😨"] as const).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleMoodSelect(emoji)}
                    className={`w-14 h-14 text-3xl rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      mood === emoji
                        ? "bg-[#9F7AEA] border-[#2D3748] scale-110 shadow-sm"
                        : "bg-white border-gray-200 hover:border-[#63B3ED]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {moodFeedback && (
                <div className="mt-3 bg-white border-2 border-[#9F7AEA] p-3 rounded-2xl text-sm font-extrabold text-[#2D3748] animate-bounce-subtle" style={{ animationDuration: '0.4s' }}>
                  {moodFeedback}
                </div>
              )}
            </div>

            {/* Form Submit wrapper */}
            <form onSubmit={handleSubmitReport} className="flex flex-col gap-6">
              
              {/* Category Selector */}
              <div className="flex flex-col gap-3">
                <span className="font-extrabold text-base text-[#2D3748]">2. اختر نوع المشكلة التي تواجهها:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-2xl border-3 font-extrabold text-right transition-all flex flex-col gap-1 cursor-pointer ${
                        category === cat.id
                          ? "bg-[#63B3ED] text-white border-[#2D3748] shadow-sm translate-y-0.5"
                          : "bg-white text-[#2D3748] border-gray-200 hover:border-[#63B3ED] hover:-translate-y-0.5 shadow-sm"
                      }`}
                    >
                      <span className="text-base">{cat.name}</span>
                      <span className={`text-[10px] ${category === cat.id ? "text-blue-100" : "text-gray-400"}`}>
                        {cat.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="flex flex-col gap-2">
                <label className="font-extrabold text-base text-[#2D3748]">3. اكتب مشكلتك بالتفصيل (اكتب بكل حرية):</label>
                <textarea
                  placeholder="اكتب هنا كل ما يضايقك أو يخيفك، ما حدث في المدرسة، أسماء الطلاب الذين ضايقوك..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="px-4 py-3 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#9F7AEA] focus:border-[#9F7AEA] focus:outline-none rounded-2xl font-bold text-sm text-right leading-relaxed resize-none shadow-sm"
                />
              </div>

              {/* Media tools grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Voice recording panel */}
                <div className="bg-[#F0FFF4] border-3 border-[#68D391] p-4 rounded-3xl flex flex-col gap-3 justify-center">
                  <span className="font-extrabold text-sm text-[#2D3748] flex items-center gap-1">
                    <Mic className="w-4 h-4 text-[#68D391]" />
                    <span>سجل مشكلتك بصوتك:</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="px-4 py-2 bg-[#68D391] text-white font-extrabold text-xs rounded-xl border-2 border-[#2D3748] shadow-sm hover:bg-[#48BB78] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5 fill-white stroke-white animate-pulse" />
                        <span>سجل الآن 🎙️</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-500 text-white font-extrabold text-xs rounded-xl border-2 border-[#2D3748] shadow-sm animate-pulse flex items-center gap-1.5 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-white stroke-white" />
                        <span>إيقاف ({recordingSeconds}ث) 🛑</span>
                      </button>
                    )}

                    {voiceURL && (
                      <div className="flex items-center gap-2 flex-grow">
                        <audio src={voiceURL} controls className="h-8 max-w-[120px] md:max-w-[180px] bg-white rounded-lg" />
                        <button
                          type="button"
                          onClick={deleteRecording}
                          className="p-1.5 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 border border-transparent hover:border-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Image panel */}
                <div className="bg-[#FFF5F5] border-3 border-[#FBB6CE] p-4 rounded-3xl flex flex-col gap-3 justify-center">
                  <span className="font-extrabold text-sm text-[#2D3748] flex items-center gap-1">
                    <Image className="w-4 h-4 text-[#FBB6CE]" />
                    <span>أرفق رسمة أو صورة (اختياري):</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-white border-2 border-dashed border-[#FBB6CE] hover:border-[#F56565] rounded-xl font-extrabold text-xs text-gray-500 cursor-pointer transition-colors shadow-sm">
                      اختر ملفاً 📁
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {imagePreview && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-[#2D3748] shadow-sm">
                        <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-[8px]"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formLoading}
                className={`w-full py-4 bg-[#9F7AEA] text-white font-black text-xl rounded-2xl border-4 border-[#2D3748] shadow-kids shadow-kids-hover transition-all duration-300 hover:bg-[#805AD5] flex items-center justify-center gap-2 cursor-pointer ${
                  formLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {formLoading ? (
                  <>
                    <div className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin"></div>
                    <span>جاري إرسال مشكلتك بأمان يا بطل... ✨</span>
                  </>
                ) : (
                  <>
                    <span>أرسل مشكلتك وحصن نفسك 🛡️🚀</span>
                    <Send className="w-6 h-6 rotate-180 fill-white" />
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
