"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import CustomToast, { ToastType } from "@/components/CustomToast";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { uploadFile } from "@/lib/cloudinary";
import { Palette, PenTool, Type, FileUp, Sparkles, Star, Heart, Award, Trash, ChevronDown } from "lucide-react";

export default function TalentsPage() {
  const { user, profile, refreshProfile } = useAuth();

  // Mode States (upload vs gallery view)
  const [activeTab, setActiveTab] = useState<"gallery" | "draw" | "story" | "upload">("gallery");

  // Canvas Drawing Board States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#2D3748");
  const [brushSize, setBrushSize] = useState(6);

  // Story & Upload States
  const [title, setTitle] = useState("");
  const [storyText, setStoryText] = useState("");
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"drawing" | "video">("drawing");
  
  const [submitLoading, setSubmitLoading] = useState(false);

  // Talents Gallery State
  const [talents, setTalents] = useState<any[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as ToastType });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
  };

  // Fetch approved talents (public) and include the current user's own talents
  const fetchApprovedTalents = async () => {
    try {
      // 1) Fetch only approved talents (required by security rules for unauthenticated/public users)
      const approvedQuery = query(collection(db, "talents"), where("approved", "==", true));
      const approvedSnapshot = await getDocs(approvedQuery);
      const fetchedTalents: any[] = [];
      approvedSnapshot.forEach((docSnap) => {
        fetchedTalents.push({ id: docSnap.id, ...docSnap.data() });
      });

      // 2) If user is signed in, also fetch their own talents (including unapproved ones)
      if (user && user.uid) {
        try {
          const ownerQuery = query(collection(db, "talents"), where("userId", "==", user.uid));
          const ownerSnapshot = await getDocs(ownerQuery);
          ownerSnapshot.forEach((docSnap) => {
            const item = { id: docSnap.id, ...docSnap.data() };
            // avoid duplicates
            if (!fetchedTalents.find((t) => t.id === item.id)) {
              fetchedTalents.push(item);
            }
          });
        } catch (ownerErr) {
          console.warn("Failed to fetch user's own talents (may be permission related):", ownerErr);
        }
      }

      fetchedTalents.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setTalents(fetchedTalents);
    } catch (err) {
      console.error("Error loading talents:", err);
    } finally {
      setTalentsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedTalents();
  }, []);

  // HTML5 Drawing Board logic
  useEffect(() => {
    if (activeTab === "draw") {
      initCanvas();
    }
  }, [activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background so transparent png isn't black in Firestore
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    
    // Support both mouse and touch events
    const pos = getEventCoords(e, canvas);
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    const pos = getEventCoords(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    initCanvas();
    showToast("تم مسح اللوحة بالكامل يا بطل! 🎨🧹", "info");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFileObj(file);
      setUploadPreview(URL.createObjectURL(file));
      if (file.type.includes("video")) {
        setUploadType("video");
      } else {
        setUploadType("drawing");
      }
    }
  };

  // Submit Drawing Board Canvas
  const handleSubmitDrawingCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!title.trim()) {
      showToast("من فضلك اكتب عنواناً جميلاً لرسمتك السحرية! ✍️", "info");
      return;
    }

    setSubmitLoading(true);
    showToast("جاري إرسال رسمتك الرائعة للمشرف... 🎨🚀", "info");

    try {
      // 1. Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png");
      });

      if (!blob) throw new Error("Canvas blob conversion failed");

      // 2. Upload to Cloudinary / simulation
      const uploadRes = await uploadFile(blob, "image");

      // 3. Write talent to Firestore
      await addDoc(collection(db, "talents"), {
        userId: user ? user.uid : "visitor",
        childName: profile?.name || "زائر موهوب 🤝",
        title: title.trim(),
        type: "drawing",
        contentUrl: uploadRes.url,
        storyText: "",
        approved: false, // Must be approved by admin
        createdAt: new Date(),
      });

      // 4. Reward stars (+15 stars reward for creative painting!)
      if (user && profile) {
        const userRef = doc(db, "users", user.uid);
        const newStars = (profile.stars || 0) + 15;
        const currentBadges = profile.badges || [];
        const updatedBadges = [...currentBadges];
        if (!updatedBadges.includes("فنان محترف 🎨")) {
          updatedBadges.push("فنان محترف 🎨");
        }
        await updateDoc(userRef, {
          stars: newStars,
          badges: updatedBadges,
        });
        await refreshProfile();
      }

      showToast("رسمتك مذهلة! وحصلت على +15 نجمة! بانتظار موافقة الإدارة 🌟🏆", "success");
      setTitle("");
      setActiveTab("gallery");
      fetchApprovedTalents();
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ في الرفع، أعد المحاولة يا بطل 😢", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Submit Short Story
  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !storyText.trim()) {
      showToast("املأ عنوان قصتك ومحتواها الجميل أولاً يا بطل ✍️📖", "info");
      return;
    }

    setSubmitLoading(true);
    showToast("جاري إرسال قصتك الممتعة للمراجعة... ✍️🚀", "info");

    try {
      await addDoc(collection(db, "talents"), {
        userId: user ? user.uid : "visitor",
        childName: profile?.name || "زائر موهوب 🤝",
        title: title.trim(),
        type: "story",
        contentUrl: "",
        storyText: storyText.trim(),
        approved: false,
        createdAt: new Date(),
      });

      // Reward stars (+15 stars for storytelling!)
      if (user && profile) {
        const userRef = doc(db, "users", user.uid);
        const newStars = (profile.stars || 0) + 15;
        const currentBadges = profile.badges || [];
        const updatedBadges = [...currentBadges];
        if (!updatedBadges.includes("كاتب عبقري ✍️")) {
          updatedBadges.push("كاتب عبقري ✍️");
        }
        await updateDoc(userRef, {
          stars: newStars,
          badges: updatedBadges,
        });
        await refreshProfile();
      }

      showToast("قصتك رائعة ومشوقة! وحصلت على +15 نجمة! بانتظار الموافقة 🌟🏆", "success");
      setTitle("");
      setStoryText("");
      setActiveTab("gallery");
      fetchApprovedTalents();
    } catch (err) {
      console.error(err);
      showToast("فشل إرسال القصة 😢", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Submit External File (Drawing or video)
  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !uploadFileObj) {
      showToast("اختر ملفاً واكتب عنواناً جميلاً أولاً يا بطل! 📁", "info");
      return;
    }

    setSubmitLoading(true);
    showToast("جاري رفع موهبتك بأمان... 🚀🌟", "info");

    try {
      const uploadRes = await uploadFile(uploadFileObj, uploadType === "video" ? "video" : "image");

      await addDoc(collection(db, "talents"), {
        userId: user ? user.uid : "visitor",
        childName: profile?.name || "زائر موهوب 🤝",
        title: title.trim(),
        type: uploadType,
        contentUrl: uploadRes.url,
        storyText: "",
        approved: false,
        createdAt: new Date(),
      });

      if (user && profile) {
        const userRef = doc(db, "users", user.uid);
        const newStars = (profile.stars || 0) + 15;
        await updateDoc(userRef, {
          stars: newStars,
        });
        await refreshProfile();
      }

      showToast("تم رفع ملفك بنجاح! وحصلت على +15 نجمة! 🌟🏆", "success");
      setTitle("");
      setUploadFileObj(null);
      setUploadPreview(null);
      setActiveTab("gallery");
      fetchApprovedTalents();
    } catch (err) {
      console.error(err);
      showToast("فشل في الرفع 😢", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const colors = [
    { id: "black", value: "#2D3748" },
    { id: "red", value: "#E53E3E" },
    { id: "blue", value: "#63B3ED" },
    { id: "purple", value: "#9F7AEA" },
    { id: "green", value: "#68D391" },
    { id: "pink", value: "#FBB6CE" },
    { id: "yellow", value: "#F6E05E" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAFF]">
      <Navbar />

      <CustomToast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-12 w-full">
        
        {/* Banner Title */}
        <div className="text-center max-w-xl mx-auto mb-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#EBF8FF] border-3 border-[#63B3ED] flex items-center justify-center text-3xl animate-bounce-subtle">
            🎨
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#2D3748]">معرض مواهب الأبطال 🌟</h1>
          <p className="text-gray-500 font-bold text-sm leading-relaxed">
            ارسم لوحات سحرية في لوحة الرسم، اكتب قصصاً ممتعة، أو شاركنا بمواهبك لتحصل على أوسمة ونجوم ويعرض عملك للجميع!
          </p>
        </div>

        {/* Dynamic Mode Switcher */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl mx-auto">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-5 py-3 rounded-2xl border-3 font-extrabold text-sm transition-all cursor-pointer ${
              activeTab === "gallery" ? "bg-[#9F7AEA] text-white border-[#2D3748] scale-105" : "bg-white text-[#2D3748] border-gray-200"
            }`}
          >
            تصفح مواهب أصدقائي 🎒🏆
          </button>
          
          {user && profile?.role === "child" && (
            <>
              <button
                onClick={() => {
                  setActiveTab("draw");
                  setTitle("");
                }}
                className={`px-5 py-3 rounded-2xl border-3 font-extrabold text-sm transition-all cursor-pointer ${
                  activeTab === "draw" ? "bg-[#63B3ED] text-white border-[#2D3748] scale-105" : "bg-white text-[#2D3748] border-gray-200"
                }`}
              >
                ارسم في اللوحة السحرية 🎨✨
              </button>
              <button
                onClick={() => {
                  setActiveTab("story");
                  setTitle("");
                  setStoryText("");
                }}
                className={`px-5 py-3 rounded-2xl border-3 font-extrabold text-sm transition-all cursor-pointer ${
                  activeTab === "story" ? "bg-[#FBB6CE] text-white border-[#2D3748] scale-105" : "bg-white text-[#2D3748] border-gray-200"
                }`}
              >
                اكتب قصة جميلة ✍️📖
              </button>
              <button
                onClick={() => {
                  setActiveTab("upload");
                  setTitle("");
                  setUploadFileObj(null);
                  setUploadPreview(null);
                }}
                className={`px-5 py-3 rounded-2xl border-3 font-extrabold text-sm transition-all cursor-pointer ${
                  activeTab === "upload" ? "bg-[#68D391] text-white border-[#2D3748] scale-105" : "bg-white text-[#2D3748] border-gray-200"
                }`}
              >
                ارفع رسمة/فيديو خارجي 📁🚀
              </button>
            </>
          )}
        </div>

        {/* 1. GALLERY TAB */}
        {activeTab === "gallery" && (
          <div>
            {talentsLoading ? (
              <div className="py-24 flex justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin"></div>
              </div>
            ) : talents.length === 0 ? (
              <div className="py-24 text-center bg-white border-4 border-[#2D3748] rounded-[36px] p-8 shadow-kids max-w-xl mx-auto flex flex-col items-center gap-3">
                <span className="text-6xl animate-bounce-subtle">🕊️</span>
                <h3 className="font-black text-xl text-[#2D3748]">المعرض فارغ حالياً يا بطل!</h3>
                <p className="text-xs font-bold text-gray-500">سجل حسابك معنا وكن أول بطل ينشر رسمته السحرية أو قصته المميزة هنا! 🚀</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {talents.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border-4 border-[#2D3748] rounded-[32px] overflow-hidden shadow-kids shadow-kids-hover transition-all duration-300 flex flex-col"
                  >
                    {/* Visual Media Header */}
                    {item.type === "drawing" && item.contentUrl && (
                      <div className="border-b-4 border-[#2D3748] bg-gray-50 aspect-square flex items-center justify-center p-2">
                        <img src={item.contentUrl} alt={item.title} className="w-full h-full object-contain rounded-2xl" />
                      </div>
                    )}

                    {item.type === "video" && item.contentUrl && (
                      <div className="border-b-4 border-[#2D3748] bg-black aspect-video flex items-center justify-center">
                        <video src={item.contentUrl} controls className="w-full h-full object-cover" />
                      </div>
                    )}

                    {item.type === "story" && (
                      <div className="border-b-4 border-[#2D3748] bg-[#FFF9E6] p-6 h-48 overflow-y-auto text-right">
                        <p className="font-extrabold text-sm text-[#5B3E03] leading-relaxed whitespace-pre-wrap">
                          {item.storyText}
                        </p>
                      </div>
                    )}

                    <div className="p-6 flex flex-col gap-3 justify-between flex-grow">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-[#FCFAFF] border-2 border-cartoon-soft rounded-lg self-start">
                          {item.type === "drawing" ? "رسمة فنية 🎨" : item.type === "story" ? "قصة مشوقة ✍️" : "فيديو موهبة 🎥"}
                        </span>
                        {!item.approved && (
                          <span className="text-[10px] font-black px-2 py-0.5 bg-yellow-100 border-2 border-yellow-300 rounded-lg self-start text-yellow-800">
                            بانتظار الموافقة ⏳
                          </span>
                        )}
                        <h3 className="font-black text-lg text-[#2D3748] leading-tight text-right">
                          {item.title}
                        </h3>
                      </div>

                      {/* Author card footer */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-dashed border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-[#FAF5FF] border-2 border-[#2D3748] flex items-center justify-center text-sm shadow-sm">
                          👦
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="font-extrabold text-xs text-[#2D3748]">{item.childName}</span>
                          <span className="text-[9px] font-black text-[#9F7AEA] mt-0.5">صاحب الموهبة المبدعة 🌟</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. DIRECT DRAWING BOARD TAB */}
        {activeTab === "draw" && (
          <div className="bg-white border-4 border-[#2D3748] rounded-[36px] p-6 md:p-8 shadow-kids max-w-3xl mx-auto flex flex-col gap-6">
            
            <div className="text-right flex flex-col gap-1.5">
              <h2 className="text-2xl font-black text-[#2D3748] flex items-center gap-2">
                <span>اللوحة السحرية للرسم 🎨✨</span>
              </h2>
              <p className="text-gray-500 font-bold text-xs">ارسم أشكالاً، قلوباً، كرتوناً جميلاً، واكتب اسمك على اللوحة لننشرها في المعرض!</p>
            </div>

            {/* Drawing controls */}
            <div className="flex flex-wrap gap-4 bg-gray-50 p-4 border-3 border-[#2D3748] rounded-2xl items-center justify-between">
              
              {/* Color swatches */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-extrabold text-xs text-gray-500">اختر لوناً:</span>
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setBrushColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
                      brushColor === c.value ? "border-[#2D3748] scale-125" : "border-transparent hover:scale-115"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              {/* Brush size */}
              <div className="flex items-center gap-2 font-extrabold text-xs text-gray-500">
                <span>حجم الفرشاة:</span>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24 cursor-pointer"
                />
                <span className="text-[#2D3748]">{brushSize}px</span>
              </div>

              {/* Clear button */}
              <button
                onClick={clearCanvas}
                className="px-3 py-1 bg-red-100 text-red-500 border border-[#2D3748] font-bold text-xs rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
              >
                مسح اللوحة 🧹
              </button>
            </div>

            {/* Title field */}
            <div className="flex flex-col gap-1.5 text-right">
              <label className="font-extrabold text-sm text-[#2D3748]">اكتب عنواناً رائعاً لرسمتك الجذابة: *</label>
              <input
                type="text"
                placeholder="مثال: رسمتي السحرية لأصدقائي، مدرستي السعيدة..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2.5 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#63B3ED] focus:border-[#63B3ED] focus:outline-none rounded-xl font-bold text-sm text-right shadow-sm"
              />
            </div>

            {/* Drawing Canvas Box */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={400}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
                className="bg-white border-4 border-[#2D3748] rounded-[24px] shadow-sm max-w-full cursor-crosshair touch-none"
              ></canvas>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitDrawingCanvas}
              disabled={submitLoading}
              className={`w-full py-4 bg-[#68D391] text-white font-black text-xl rounded-2xl border-4 border-[#2D3748] shadow-kids shadow-kids-hover hover:bg-[#48BB78] flex items-center justify-center gap-2 cursor-pointer ${
                submitLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {submitLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>جاري تعليق رسمتك على المعرض السحري...</span>
                </>
              ) : (
                <>
                  <span>تأكيد رسمتي ونشرها في المعرض! 🎨🚀</span>
                </>
              )}
            </button>

          </div>
        )}

        {/* 3. SHORT STORY TAB */}
        {activeTab === "story" && (
          <div className="bg-white border-4 border-[#2D3748] rounded-[36px] p-6 md:p-8 shadow-kids max-w-2xl mx-auto">
            <div className="text-right mb-6">
              <h2 className="text-2xl font-black text-[#2D3748]">اكتب قصة مشوقة ومبدعة ✍️📖</h2>
              <p className="text-gray-500 font-bold text-xs mt-1">دع خيالك الواسع يحلق! اكتب قصة بطلها صديق وفيّ، أو قصة عن التعاون والأخلاق.</p>
            </div>

            <form onSubmit={handleSubmitStory} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5 text-right">
                <label className="font-extrabold text-sm text-[#2D3748]">عنوان قصتك السحرية: *</label>
                <input
                  type="text"
                  placeholder="مثال: البطل يوسف وصديقه الوفي، قوة التعاون في حديقتنا..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-4 py-2.5 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#FBB6CE] focus:border-[#FBB6CE] focus:outline-none rounded-xl font-bold text-sm text-right shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-right">
                <label className="font-extrabold text-sm text-[#2D3748]">اكتب سطور القصة هنا (من قلبك): *</label>
                <textarea
                  placeholder="في قديم الزمان كان هناك بطل يحب مساعدة الطلاب..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  rows={8}
                  className="px-4 py-3 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#FBB6CE] focus:border-[#FBB6CE] focus:outline-none rounded-xl font-bold text-sm text-right leading-relaxed resize-none shadow-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className={`w-full py-4 mt-2 bg-[#FBB6CE] text-[#2D3748] font-black text-xl rounded-2xl border-4 border-[#2D3748] shadow-kids shadow-kids-hover hover:bg-[#F6A3C0] flex items-center justify-center gap-2 cursor-pointer ${
                  submitLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {submitLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>جاري نشر قصتك السحرية...</span>
                  </>
                ) : (
                  <>
                    <span>انشر قصتي المشوقة في المعرض! ✍️🚀</span>
                  </>
                )}
              </button>

            </form>
          </div>
        )}

        {/* 4. EXTERNAL FILE UPLOAD TAB */}
        {activeTab === "upload" && (
          <div className="bg-white border-4 border-[#2D3748] rounded-[36px] p-6 md:p-8 shadow-kids max-w-xl mx-auto">
            <div className="text-right mb-6">
              <h2 className="text-2xl font-black text-[#2D3748]">ارفع موهبتك كملف 📁🚀</h2>
              <p className="text-gray-500 font-bold text-xs mt-1">هل رسمت لوحة مسبقاً، أو صورت فيديو لموهبتك في الإنشاد أو التحدث؟ ارفعها فوراً!</p>
            </div>

            <form onSubmit={handleSubmitFile} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5 text-right">
                <label className="font-extrabold text-sm text-[#2D3748]">عنوان الموهبة المرفوعة: *</label>
                <input
                  type="text"
                  placeholder="مثال: لوحة زيتية رسمتها أمس، فيديو إلقاء شعر..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-4 py-2.5 bg-[#FCFAFF] border-3 border-gray-200 hover:border-[#68D391] focus:border-[#68D391] focus:outline-none rounded-xl font-bold text-sm text-right shadow-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 text-right">
                <label className="font-extrabold text-sm text-[#2D3748]">اختر ملف الموهبة (صورة أو فيديو): *</label>
                <div className="border-3 border-dashed border-[#68D391] p-6 rounded-2xl bg-[#F0FFF4] flex flex-col items-center gap-3 hover:bg-[#E6FFFA] transition-colors cursor-pointer relative">
                  <FileUp className="w-10 h-10 text-[#68D391] animate-bounce-subtle" />
                  <span className="font-extrabold text-sm text-gray-500">انقر لاختيار ملف من جهازك</span>
                  <span className="text-[10px] text-gray-400 font-bold">يقبل ملفات الصور والفيديوهات الصغيرة</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                </div>

                {uploadPreview && (
                  <div className="mt-3 flex justify-center">
                    {uploadType === "video" ? (
                      <video src={uploadPreview} controls className="max-w-[200px] rounded-xl border-2 border-[#2D3748] shadow-sm h-32 object-cover" />
                    ) : (
                      <img src={uploadPreview} alt="معاينة" className="max-w-[200px] rounded-xl border-2 border-[#2D3748] shadow-sm h-32 object-cover" />
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className={`w-full py-4.5 mt-2 bg-[#68D391] text-white font-black text-xl rounded-2xl border-4 border-[#2D3748] shadow-kids shadow-kids-hover hover:bg-[#48BB78] flex items-center justify-center gap-2 cursor-pointer ${
                  submitLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {submitLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>جاري الرفع السريع لملفك...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد الرفع ومشاركتها في معرضي 🚀🌟</span>
                  </>
                )}
              </button>

            </form>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
