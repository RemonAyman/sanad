"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import CustomToast, { ToastType } from "@/components/CustomToast";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { uploadFile } from "@/lib/cloudinary";
import { Send, Mic, Square, Trash2, Image, Star, Shield, HelpCircle, Heart } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  // Chat message states
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);

  // Media attachments
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceURL, setVoiceURL] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // DOM ref to keep chat scrolled to bottom
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Subscribe to real-time messages for this child
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort chronologically in memory by createdAt
      msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(msgs);
      setChatLoading(false);
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.warn("Firestore messages subscription permission denied (check security rules):", error);
      setChatLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTyping]);

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
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      showToast("جاري تسجيل الرسالة الصوتية... 🎙️", "info");
    } catch (err) {
      console.error("Audio access error:", err);
      showToast("يرجى السماح بالوصول للميكروفون للتسجيل 🎙️", "error");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Predefined AI supportive replies
  const aiReplies = [
    "أنا هنا لمساعدتك ❤️",
    "أنت شخص رائع وشجاع 🌟",
    "لا تقلق، سنتحدث معًا لحل المشكلة 😊",
    "مشاعرك مهمة جدًا 💙",
    "تذكر دائماً أنك مميز ولست وحدك في هذه الدنيا 🕊️",
    "كل شيء سيكون بخير يا بطل، نحن فخورون جداً بشجاعتك! 🏆"
  ];

  const pickAiReply = (message: string) => {
    const normalized = message.trim().toLowerCase();

    if (/حزين|زعلان|مهموم|حزن/.test(normalized)) {
      return "أفهم شعورك، وأنت لست وحدك. مع بعض سنشعر بتحسن، وأنا هنا لأدعمك دائماً 💛";
    }
    if (/خائف|قلق|مرتعش|أخاف/.test(normalized)) {
      return "لا تقلق، أنت في مكان آمن ويمكنك مشاركة كل ما يقلقك. سنواجه ذلك خطوة بخطوة معاً. 🤝";
    }
    if (/غضب|زعل|متعصب|انزعاج/.test(normalized)) {
      return "من الطبيعي أن تشعر بهذا، ومهم نعطي نفسنا فرصة لنهدأ. جرب تنفس بعمق وأخبرني ماذا حدث 🌿";
    }
    if (/وحدي|وحيد|لا أحد/.test(normalized)) {
      return "أنت مهم جداً ولست وحدك هنا. يمكنني الاستماع لك دائماً ونسعى معاً لتخفيف هذا الشعور ❤️";
    }
    if (/حلو|مبسوط|سعيد|فرحان/.test(normalized)) {
      return "فرحان جداً لأجلك! استمر في مشاركة الأشياء الجميلة، لأن البسمة منك تضيء اليوم 😊";
    }
    if (/مدرسة|أصدقاء|زملاء/.test(normalized)) {
      return "المدرسة والأصدقاء ممكن يكونوا ممتعين وأحياناً صعبين. أخبرني أكثر لكي أساعدك بكيفية التعامل بطريقة لطيفة ومرحة ✨";
    }
    return aiReplies[Math.floor(Math.random() * aiReplies.length)];
  };

  // Send message to Firestore
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() && !imageFile && !voiceBlob) return;

    const messageText = text.trim();
    const currentImageFile = imageFile;
    const currentVoiceBlob = voiceBlob;

    // Reset inputs immediately for responsive UX
    setText("");
    setImageFile(null);
    setImagePreview(null);
    setVoiceBlob(null);
    setVoiceURL(null);

    try {
      let uploadedImageUrl = "";
      let uploadedVoiceUrl = "";

      // 1. Upload files if present
      if (currentImageFile) {
        const res = await uploadFile(currentImageFile, "image");
        uploadedImageUrl = res.url;
      }
      if (currentVoiceBlob) {
        const res = await uploadFile(currentVoiceBlob, "raw");
        uploadedVoiceUrl = res.url;
      }

      // 2. Add message to database
      await addDoc(collection(db, "messages"), {
        userId: user!.uid,
        sender: "child",
        childName: profile?.name || "بطل سند",
        text: messageText,
        imageUrl: uploadedImageUrl,
        voiceUrl: uploadedVoiceUrl,
        createdAt: new Date(),
      });

      // 3. Trigger simulated AI response after a 1.5s delay
      setAiTyping(true);

      setTimeout(async () => {
        try {
          const randomReply = pickAiReply(messageText || "");
          
          await addDoc(collection(db, "messages"), {
            userId: user!.uid,
            sender: "ai",
            childName: "المساعد اللطيف",
            text: randomReply,
            imageUrl: "",
            voiceUrl: "",
            createdAt: new Date(),
          });

          // Reward stars for chatting! (+2 stars)
          const userRef = doc(db, "users", user!.uid);
          const newStars = (profile?.stars || 0) + 2;
          await updateDoc(userRef, {
            stars: newStars,
          });
          await refreshProfile();
        } catch (err) {
          console.error("Error writing AI response:", err);
        } finally {
          setAiTyping(false);
        }
      }, 1500);

    } catch (err) {
      console.error("Error sending message:", err);
      showToast("فشل إرسال الرسالة، يرجى المحاولة لاحقاً 😢", "error");
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAFF]">
        <div className="w-16 h-16 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin mb-4"></div>
        <p className="font-extrabold text-xl text-[#2D3748]">نفتح خط الدردشة الآمن لغرفتك... 💬✨</p>
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

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full flex flex-col h-[75vh]">
        
        {/* Safe chat top banner */}
        <div className="bg-white border-4 border-[#2D3748] rounded-[24px] p-4 shadow-kids flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF8FF] border-2 border-[#2D3748] flex items-center justify-center text-xl">
              🕊️
            </div>
            <div className="flex flex-col text-right">
              <span className="font-black text-sm text-[#2D3748]">مساعد سند اللطيف 🧸</span>
              <span className="text-[10px] font-bold text-green-500">متصل الآن لمساعدتك</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#EBF8FF] border-2 border-[#63B3ED] px-3 py-1 rounded-xl text-xs font-black text-[#2B6CB0]">
            <Shield className="w-4 h-4 text-[#63B3ED]" />
            <span>دردشة مشفرة وسرية</span>
          </div>
        </div>

        {/* Chat Messages Frame */}
        <div className="flex-grow bg-white border-4 border-[#2D3748] rounded-[32px] p-6 shadow-kids flex flex-col gap-4 overflow-y-auto mb-4 min-h-0 relative">
          
          {chatLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <div className="w-10 h-10 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="my-auto text-center flex flex-col items-center gap-4 max-w-sm mx-auto">
              <span className="text-6xl animate-bounce-subtle">🧸</span>
              <h3 className="font-black text-lg text-[#2D3748]">أهلاً بك يا بطل في دردشتك الخاصة!</h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                اكتب أي شيء هنا أو سجل صوتك! مساعد سند الذكي والمشرف المتابع للغرفة يستمعان إليك بكل حب. قل مرحباً 👋
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => {
                const isChild = msg.sender === "child";
                const isAi = msg.sender === "ai";
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isChild ? "mr-auto flex-row-reverse" : "ml-auto"}`}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full border-2 border-[#2D3748] flex-shrink-0 flex items-center justify-center text-sm shadow-sm bg-white">
                      {isChild ? "👦" : isAi ? "🧸" : "👮"}
                    </div>

                    {/* Balloon Bubble */}
                    <div
                      className={`p-3.5 rounded-[22px] border-3 text-sm font-extrabold shadow-sm ${
                        isChild
                          ? "bg-[#63B3ED] border-[#2D3748] text-white rounded-tr-none"
                          : isAi
                          ? "bg-[#FAF5FF] border-[#2D3748] text-[#2D3748] rounded-tl-none"
                          : "bg-[#EBF8FF] border-[#2D3748] text-[#2D3748] rounded-tl-none"
                      }`}
                    >
                      {/* Name of sender */}
                      <span className="block text-[10px] font-black opacity-75 mb-1 text-right">
                        {isChild ? "أنا" : isAi ? "مساعد سند اللطيف" : "أخصائي سند"}
                      </span>

                      {/* Text */}
                      {msg.text && <p className="leading-relaxed text-right">{msg.text}</p>}

                      {/* Image attachments */}
                      {msg.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-[#2D3748] max-w-[200px] shadow-sm bg-white">
                          <img src={msg.imageUrl} alt="مرفق" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      {/* Voice attachments */}
                      {msg.voiceUrl && (
                        <div className="mt-2 flex items-center">
                          <audio src={msg.voiceUrl} controls className="h-8 max-w-[180px] bg-white rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Simulated Counselor Typing status */}
              {aiTyping && (
                <div className="flex gap-3 ml-auto max-w-[80%] animate-pulse">
                  <div className="w-9 h-9 rounded-full border-2 border-[#2D3748] bg-white flex items-center justify-center text-sm shadow-sm">
                    🧸
                  </div>
                  <div className="bg-gray-100 border-3 border-[#2D3748] px-4 py-3 rounded-2xl rounded-tl-none font-bold text-xs text-gray-500">
                    مساعد سند يكتب لك رسالة دافئة... 💬
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Media preview panel before sending */}
        {(imagePreview || voiceURL) && (
          <div className="bg-white border-4 border-[#2D3748] rounded-2xl p-3 mb-2 flex items-center justify-between gap-4 animate-bounce-subtle" style={{ animationDuration: '0.4s' }}>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300">
                  <img src={imagePreview} alt="مرفق" className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute inset-0 bg-black bg-opacity-40 text-white font-bold text-[8px] flex items-center justify-center"
                  >
                    إلغاء
                  </button>
                </div>
              )}

              {voiceURL && (
                <div className="flex items-center gap-1">
                  <audio src={voiceURL} controls className="h-8 max-w-[160px]" />
                  <button
                    onClick={() => {
                      setVoiceBlob(null);
                      setVoiceURL(null);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-xs font-black text-gray-400">مرفق جاهز للإرسال 📎</span>
          </div>
        )}

        {/* Input Controls Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          
          {/* Main text box */}
          <input
            type="text"
            placeholder="اكتب رسالة جميلة أو قل مرحباً لمساعد سند... 💬"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isRecording}
            className="flex-grow px-4 py-4 bg-white border-4 border-[#2D3748] rounded-2xl font-bold text-sm text-right focus:outline-none focus:border-[#9F7AEA] shadow-sm disabled:opacity-50"
          />

          {/* Picture attachments button */}
          <label className="p-3 bg-[#FFF5F5] border-4 border-[#2D3748] rounded-2xl text-[#2D3748] hover:bg-[#FBB6CE] transition-all flex items-center justify-center cursor-pointer shadow-sm">
            <Image className="w-6 h-6" />
            <input
              type="file"
              accept="image/*"
              disabled={isRecording}
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Audio Recorder button */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="p-3 bg-[#F0FFF4] border-4 border-[#2D3748] rounded-2xl text-[#2D3748] hover:bg-[#68D391] transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title="سجل رسالة صوتية"
            >
              <Mic className="w-6 h-6 text-[#22543D]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="p-3 bg-red-500 border-4 border-[#2D3748] rounded-2xl text-white animate-pulse flex items-center justify-center cursor-pointer shadow-sm"
              title="إيقاف التسجيل"
            >
              <Square className="w-6 h-6" />
            </button>
          )}

          {/* Send button */}
          <button
            type="submit"
            className="px-6 py-3 bg-[#68D391] text-white border-4 border-[#2D3748] rounded-2xl font-black text-sm shadow-sm hover:bg-[#48BB78] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>أرسل</span>
            <Send className="w-4 h-4 rotate-180 fill-white" />
          </button>

        </form>

      </main>

      <Footer />
    </div>
  );
}
