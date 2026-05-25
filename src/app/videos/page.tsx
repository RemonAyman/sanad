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
  description: string;
  category: "anti-bullying" | "confidence" | "respect" | "anger-control" | "friendship";
  youtubeId?: string;
  videoUrl?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
}

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "videos"));
        const dbVideos: VideoItem[] = [];
        querySnapshot.forEach((docSnap) => {
          dbVideos.push({ id: docSnap.id, ...docSnap.data() } as VideoItem);
        });
        setVideos(dbVideos);
      } catch (err) {
        console.warn("Failed to load videos from Firestore:", err);
        setVideos([]);
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
            <span className="text-6xl animate-bounce-subtle">�</span>
            <h3 className="font-black text-gray-800 text-xl">لا توجد فيديوهات متاحة حالياً.</h3>
            <p className="max-w-xl text-gray-500 font-bold leading-relaxed">
              هذه الصفحة تعتمد الآن على روابط الفيديو التي تُضاف من قبل الإدارة فقط. تفضل بالدخول إلى لوحة الإدارة لإضافة رابط YouTube أو Facebook أو TikTok للعمل داخل WebView.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="bg-white border-4 border-[#2D3748] rounded-[32px] overflow-hidden shadow-kids shadow-kids-hover transition-all duration-300 flex flex-col cursor-pointer group"
              >
                {/* Thumbnail Preview with Play button */}
                <div className="relative aspect-video border-b-4 border-[#2D3748] bg-gray-900 overflow-hidden flex items-center justify-center">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : video.youtubeId ? (
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2D3748] flex flex-col items-center justify-center text-white text-sm font-black px-4 text-center">
                        <span className="text-3xl mb-2">📺</span>
                        <span>هذا الفيديو من رابط الإدارة</span>
                      </div>
                    )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white border-3 border-[#2D3748] flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 rotate-0 group-hover:rotate-6 transition-all duration-300">
                      ▶️
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-gray-950/80 backdrop-blur-sm border-2 border-[#2D3748] px-2.5 py-1 rounded-xl text-[10px] font-black text-white">
                    عرض تفاعلي 🍿
                  </div>
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

                  <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-dashed border-gray-100">
                    <span className="px-4 py-2 bg-[#63B3ED]/15 text-[#2B6CB0] border-2 border-dashed border-[#2B6CB0]/40 rounded-xl text-[10px] font-black group-hover:bg-[#63B3ED]/25 transition-all">
                      شاهد الآن 🎬
                    </span>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-gray-400">
                      <Film className="w-4 h-4 text-[#9F7AEA]" />
                      <span>مشاهدة آمنة للأطفال 🤍</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom In-App WebView Theater Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-3xl bg-white border-4 border-[#2D3748] rounded-[36px] overflow-hidden shadow-kids flex flex-col relative">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white border-3 border-[#2D3748] rounded-full flex items-center justify-center text-lg font-black hover:bg-gray-100 transition-colors z-10 cursor-pointer shadow-md"
              >
                ❌
              </button>

              {/* Theater Banner */}
              <div className="bg-[#FAF5FF] border-b-4 border-[#2D3748] p-5 text-right pr-16">
                <h3 className="font-black text-xl text-[#2D3748] flex items-center gap-2 justify-start">
                  <span>🎬 سينما سند التفاعلية للأطفال</span>
                </h3>
                <p className="text-xs font-bold text-gray-500 mt-1">{selectedVideo.title}</p>
              </div>

              {/* Interactive Player (WebView Frame) */}
              <div className="relative aspect-video bg-black border-b-4 border-[#2D3748]">
                {selectedVideo.videoUrl ? (
                  <video
                    className="w-full h-full"
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline
                  />
                ) : selectedVideo.sourceUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={selectedVideo.sourceUrl}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : selectedVideo.youtubeId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-black px-4 text-center bg-[#2D3748]">
                    هذا الفيديو غير متوفر حالياً، يرجى اختيار فيديو آخر.
                  </div>
                )}
              </div>

              {/* Secure Web Fallback for blocked embeds */}
              <div className="p-6 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs font-extrabold text-gray-500 text-right leading-relaxed max-w-md">
                  💡 إذا لم يعمل العرض داخل التطبيق، اضغط على الرابط التالي لمشاهدة الفيديو مباشرة في صفحة تشغيل آمنة.
                </p>
                <div className="flex gap-2 w-full md:w-auto">
                  {selectedVideo.youtubeId ? (
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow md:flex-grow-0 px-6 py-3 bg-[#F6E05E] text-[#2D3748] border-3 border-[#2D3748] rounded-2xl font-black text-xs hover:bg-[#FAF089] hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>شاهد على يوتيوب 🍿</span>
                    </a>
                  ) : selectedVideo.videoUrl || selectedVideo.sourceUrl ? (
                    <a
                      href={selectedVideo.videoUrl || selectedVideo.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow md:flex-grow-0 px-6 py-3 bg-[#F6E05E] text-[#2D3748] border-3 border-[#2D3748] rounded-2xl font-black text-xs hover:bg-[#FAF089] hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>افتح الفيديو في نافذة جديدة 🎬</span>
                    </a>
                  ) : null}
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="px-5 py-3 bg-white text-gray-700 border-3 border-gray-300 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    إغلاق السينما 🏠
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
