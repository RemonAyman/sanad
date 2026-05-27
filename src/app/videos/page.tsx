"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Play, Sparkles, Star, Award, Heart, Film, Search } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: "anti-bullying" | "confidence" | "respect" | "anger-control" | "friendship";
  youtubeId?: string;
  embedUrl?: string;
  videoUrl?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
}

const defaultVideos: VideoItem[] = [
  {
    id: "video-1",
    title: "تأثير الكلمة السيئة",
    description: "قصة تعليمية عن قوة الكلام وتأثيره على مشاعر الآخرين.",
    category: "anti-bullying",
    youtubeId: "lwYf9AbQfbU",
  },
  {
    id: "video-2",
    title: "التخلص من الغضب",
    description: "طرق بسيطة للأطفال للتحكم في الغضب بسلام.",
    category: "anger-control",
    youtubeId: "08BHHqN6NYo",
  },
  {
    id: "video-3",
    title: "الثقة بالنفس 1",
    description: "فيديو يساعد الطفل على بناء ثقته بنفسه خطوة بخطوة.",
    category: "confidence",
    youtubeId: "UI1DuW-iArs",
  },
  {
    id: "video-4",
    title: "الثقة بالنفس 2",
    description: "قصة جديدة لتعزيز الثقة بالنفس لدى الأطفال.",
    category: "confidence",
    youtubeId: "2ho3W7rrd2I",
  },
  {
    id: "video-5",
    title: "الثقة بالنفس 3",
    description: "معلومات ممتعة لتشجيع الطفل على حب نفسه.",
    category: "confidence",
    youtubeId: "6yiSSUnKpUc",
  },
  {
    id: "video-6",
    title: "الثقة بالنفس 4",
    description: "فيديو قصير يساعد الأطفال على التفكير بثقة.",
    category: "confidence",
    youtubeId: "wTycAHWUlEg",
  },
  {
    id: "video-7",
    title: "قصة الاحترام سر المحبة",
    description: "قصة مؤثرة عن الاحترام وكيف يجلب المحبة.",
    category: "respect",
    youtubeId: "PLgNI3teevQ",
  },
  {
    id: "video-8",
    title: "قصة كلنا مختلفون",
    description: "قصة تعليمية عن احترام الاختلاف والتعايش مع الجميع.",
    category: "respect",
    youtubeId: "HhsDzKYRaso",
  },
  {
    id: "video-9",
    title: "وحش الغضب",
    description: "فيديو يساعد الطفل على التعرف على غضبه والتعامل معه.",
    category: "anger-control",
    youtubeId: "s_z4Z02Lpk0",
  },
  {
    id: "video-10",
    title: "لا للتنمر",
    description: "رسالة قوية للأطفال بعدم قبول التنمر بأي شكل.",
    category: "anti-bullying",
    youtubeId: "oTfXz6UNLN4",
  },
  {
    id: "video-11",
    title: "زياد والسخرية",
    description: "حكاية تعليمية عن السخرية وكيف تؤثر على الأصدقاء.",
    category: "anti-bullying",
    youtubeId: "z3wceKwQPmA",
  },
  {
    id: "video-12",
    title: "جسر الصداقة",
    description: "قصة قصيرة عن قوة الصداقة والتعاون.",
    category: "friendship",
    youtubeId: "t-n48BawWlo",
  },
  {
    id: "video-13",
    title: "الصديق وقت الضيق",
    description: "درس جميل عن كيفية الوقوف إلى جانب الأصدقاء.",
    category: "friendship",
    youtubeId: "pBR0hOA_SyU",
  },
  {
    id: "video-14",
    title: "الصديق المخلص",
    description: "قصة عن الصديق الحقيقي ودوره في الحياة.",
    category: "friendship",
    youtubeId: "HvijxnEwVak",
  },
  {
    id: "video-15",
    title: "السيطرة على الغضب",
    description: "نصائح بسيطة للطفل للهدوء عندما يغضب.",
    category: "anger-control",
    youtubeId: "jWeWZGV68l8",
  },
  {
    id: "video-16",
    title: "السيطرة على الغضب في اللعب",
    description: "كيف يلعب الطفل براحة دون أن يتحول اللعب إلى غضب.",
    category: "anger-control",
    youtubeId: "hDQduOVLJB4",
  },
  {
    id: "video-17",
    title: "أغنية السيطرة على الغضب",
    description: "أغنية ممتعة تعلم الأطفال التحكم في مشاعرهم.",
    category: "anger-control",
    youtubeId: "mamSfMYWACM",
  },
  {
    id: "video-18",
    title: "التحكم في الغضب",
    description: "درس بسيط ومباشر عن التحكم في الانفعال.",
    category: "anger-control",
    youtubeId: "uP5BNTSyNYI",
  },
  {
    id: "video-19",
    title: "الغضب والبالون الطائر",
    description: "قصة مرحة تربط بين الغضب والطيران الحر.",
    category: "anger-control",
    youtubeId: "MwOiuoPAQOc",
  },
  {
    id: "video-20",
    title: "التنمر والثقة بالنفس",
    description: "فيديو يعزز الوعي بالثقة بالنفس والتعامل مع التنمر.",
    category: "anti-bullying",
    youtubeId: "7-lBYU7iRgM",
  },
  {
    id: "video-21",
    title: "احترام الآخر",
    description: "رسالة قصيرة عن كيف نحترم الآخرين ونتصرف معهم بلطف.",
    category: "respect",
    youtubeId: "A2rtQNK4Nps",
  },
  {
    id: "video-22",
    title: "احترام الآخرين",
    description: "قصة صغيرة عن أهمية الاحترام المتبادل بين الأطفال.",
    category: "respect",
    youtubeId: "xsKoAUp-_dI",
  },
];

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [videos, setVideos] = useState<VideoItem[]>(defaultVideos);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading] = useState(false);

  const categories = [
    { id: "all", label: "كل الفيديوهات 🎬" },
    { id: "anti-bullying", label: "مواجهة التنمر 🛡️" },
    { id: "confidence", label: "الثقة بالنفس 🌟" },
    { id: "respect", label: "الاحترام 🤝" },
    { id: "anger-control", label: "التحكم في الغضب 🕊️" },
    { id: "friendship", label: "الصداقة الجميلة 🧸" },
  ];

  const getEmbedUrl = (video: VideoItem) => {
    if (video.videoUrl) return video.videoUrl;
    if (video.youtubeId) return `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`;
    if (!video.sourceUrl) return null;

    const raw = video.sourceUrl.trim();
    const facebookMatch = raw.match(/(?:facebook\.com|m\.facebook\.com|fb\.watch)\//i);
    if (facebookMatch) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=0&width=560`;
    }

    const tiktokMatch = raw.match(/(?:tiktok\.com|vm\.tiktok\.com)\/(?:@[^/]+\/video\/|embed\/v2\/|embed\/|video\/)?(\d+)/i);
    if (tiktokMatch && tiktokMatch[1]) {
      return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
    }

    return raw;
  };

  const filteredVideos = activeCategory === "all"
    ? videos
    : videos.filter((v) => v.category === activeCategory);

  const selectedVideoEmbedUrl = selectedVideo ? getEmbedUrl(selectedVideo) : null;

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
                {selectedVideo?.videoUrl ? (
                  <video
                    className="w-full h-full"
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline
                  />
                ) : selectedVideoEmbedUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={selectedVideoEmbedUrl}
                    title={selectedVideo?.title}
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
