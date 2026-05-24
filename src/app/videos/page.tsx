"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Play, Sparkles, Star, Award, Heart, Film, Search } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  category: "anti-bullying" | "confidence" | "respect" | "anger-control" | "friendship";
  description: string;
}

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Curated educational seed videos (fallback and defaults)
  const seedVideos: VideoItem[] = [
    {
      id: "seed-1",
      title: "التنمر المدرسي: كيف نتعامل معه بذكاء وشجاعة؟ 🛡️",
      youtubeId: "pew8c2Z19l0",
      category: "anti-bullying",
      description: "فيديو جميل يعلمك كيف تواجه التنمر وتتكلم بثقة وتطلب المساعدة من الكبار دون خوف.",
    },
    {
      id: "seed-2",
      title: "قصة عن الثقة بالنفس للأطفال: أنت رائع كما أنت! 🌟",
      youtubeId: "Qp492j22_Jk",
      category: "confidence",
      description: "تعلّم كيف تحب نفسك وتثق في قدراتك الخاصة لأنك طفل مميز وموهوب ولن يوقفك شيء!",
    },
    {
      id: "seed-3",
      title: "ما هو الاحترام المتبادل؟ قصص تربوية هادفة 🤝",
      youtubeId: "U3Z_n_9nIes",
      category: "respect",
      description: "فيديو يعرض كيف نحترم الآخرين ونعامل زملائنا بلطف لنعيش جميعاً في حب وسلام.",
    },
    {
      id: "seed-4",
      title: "التحكم في الغضب: كيف أهدأ عندما أشعر بالانزعاج؟ 🕊️",
      youtubeId: "3mKq84i-U8g",
      category: "anger-control",
      description: "تمرين التنفس السحري والعد إلى 10 لمساعدة أصدقائنا في إزالة الغضب وتهدئة مشاعرهم سريعاً.",
    },
    {
      id: "seed-5",
      title: "سر الصداقة الحقيقية: كيف أصنع أصدقاء أوفياء؟ 🧸",
      youtubeId: "k5uP50P1gq0",
      category: "friendship",
      description: "فيديو رائع يلخص أهمية الصداقة وطريقة التعامل اللطيف لصناعة صداقات تدوم طويلاً.",
    },
    {
      id: "seed-6",
      title: "بناء تقدير الذات والتغلب على الخوف المدرسي 💪",
      youtubeId: "vB0X6-aP92k",
      category: "confidence",
      description: "شاهد كيف تتغلب على رهبة الفصل الجديد والتحدث أمام المعلم بثقة وقوة.",
    }
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "videos"));
        const dbVideos: VideoItem[] = [];
        querySnapshot.forEach((docSnap) => {
          dbVideos.push({ id: docSnap.id, ...docSnap.data() } as VideoItem);
        });

        // Combine seed videos with DB videos (avoiding duplicates)
        const combined = [...dbVideos];
        seedVideos.forEach((seed) => {
          if (!combined.some((v) => v.youtubeId === seed.youtubeId)) {
            combined.push(seed);
          }
        });
        setVideos(combined);
      } catch (err) {
        console.warn("Failed to load videos from Firestore, loading static seed videos:", err);
        setVideos(seedVideos);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const categories = [
    { id: "all", label: "كل الفيديوهات 🎬" },
    { id: "anti-bullying", label: "مواجهة التنمر 🛡️" },
    { id: "confidence", label: "الثقة بالنفس 🌟" },
    { id: "respect", label: "الاحترام 🤝" },
    { id: "anger-control", label: "التحكم في الغضب 🕊️" },
    { id: "friendship", label: "الصداقة الجميلة 🧸" },
  ];

  const filteredVideos = activeCategory === "all"
    ? videos
    : videos.filter((v) => v.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAFF]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        
        {/* Top Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#FAF5FF] border-3 border-[#9F7AEA] flex items-center justify-center text-3xl animate-bounce-subtle">
            🎬
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#2D3748]">مكتبة الفيديوهات التعليمية 🍿</h1>
          <p className="text-gray-500 font-bold">
            شاهد معنا فيديوهات مسلية وقصصاً جميلة ومفيدة لتتعلم كيف تكون واثقاً من نفسك، سعيداً، ومحبوباً من الجميع!
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-2xl border-3 font-extrabold text-sm transition-all cursor-pointer shadow-sm ${
                activeCategory === cat.id
                  ? "bg-[#9F7AEA] text-white border-[#2D3748] scale-105 translate-y-0.5"
                  : "bg-white text-[#2D3748] border-gray-200 hover:border-[#9F7AEA] hover:-translate-y-0.5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#9F7AEA] border-t-transparent animate-spin"></div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-3">
            <span className="text-6xl animate-bounce-subtle">🕊️</span>
            <p className="font-bold text-gray-400 text-lg">لا توجد فيديوهات في هذا القسم حالياً، يرجى تصفح بقية الأقسام!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white border-4 border-[#2D3748] rounded-[32px] overflow-hidden shadow-kids shadow-kids-hover transition-all duration-300 flex flex-col"
              >
                {/* Embed YouTube player as thumbnail/preview */}
                <div className="relative aspect-video border-b-4 border-[#2D3748] bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="p-6 flex flex-col gap-3 flex-grow justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-[#FCFAFF] border-2 border-cartoon-soft rounded-lg self-start">
                      {categories.find((c) => c.id === video.category)?.label || video.category}
                    </span>
                    <h3 className="font-black text-lg text-[#2D3748] leading-snug text-right">
                      {video.title}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed text-right">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-4 pt-4 border-t-2 border-dashed border-gray-100 text-xs font-extrabold text-gray-400">
                    <Film className="w-4 h-4 text-[#9F7AEA]" />
                    <span>مشاهدة آمنة ومريحة للأطفال 🤍</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
