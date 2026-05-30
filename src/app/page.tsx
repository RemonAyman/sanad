"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Heart, Star, Sparkles, Shield, Play, Smile, Volume2, Award, ArrowLeft } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const dailyTips: Record<string, string> = {
    "😊": "ابتسامتك تنير العالم! تذكر دائماً أنك طفل رائع وشجاع جداً.",
    "😢": "الحزن مشاعر طبيعية، لا تقلق يا بطل! نحن هنا لنستمع إليك ونساعدك.",
    "😡": "عندما تشعر بالغضب، خذ نفساً عميقاً وعد إلى 10. الغضب يزول دائماً بالهدوء.",
    "😨": "الخوف أمر طبيعي يحدث للجميع. تذكر أنك قوي جداً ولديك سند يحميك ويساعدك.",
  };

  const features = [
    {
      icon: "💬",
      title: "دردشة سرية وآمنة",
      desc: "احكي لمرشدك الخاص في سرية تامة دون خوف. كلامك مسموع ومحمي دائماً.",
      color: "bg-[#EBF8FF] text-[#2B6CB0]",
    },
    {
      icon: "🎥",
      title: "جلسات زوم ودية",
      desc: "تحدث معنا وجهاً لوجه عبر زوم لنفكر معاً في حلول لكل مشكلاتك في المدرسة.",
      color: "bg-[#FAF5FF] text-[#6B46C1]",
    },
    {
      icon: "🎨",
      title: "معرض إظهار مواهبك",
      desc: "ارسم لوحات جميلة، أو اكتب قصصاً بطلها أنت، وانشرها ليراها جميع أصدقائك!",
      color: "bg-[#F0FFF4] text-[#22543D]",
    },
    {
      icon: "⭐",
      title: "نظام المكافآت والأوسمة",
      desc: "اجمع النجوم الذهبية الرائعة واحصل على أوسمة الأبطال مثل 'طفل شجاع' و'صديق محترم'.",
      color: "bg-[#FEFCBF] text-[#744210]",
    },
  ];

  const testimonials = [
    {
      name: "يوسف (10 سنوات)",
      avatar: "👦",
      text: "كنت أشعر بالوحدة الشديدة في مدرستي الجديدة، ولكن بعد أن تحدثت مع مرشد سند اللطيف، علمني كيف أصنع صداقات جميلة. الآن لدي 3 أصدقاء جدد!",
      badge: "طفل شجاع 🌟",
    },
    {
      name: "لينا (8 سنوات)",
      avatar: "👧",
      text: "رسمت رسمة على لوحة الرسم في سند والمشرف نشرها في معرض المواهب! حصلت على وسام بطل التعاون ونجوم كثيرة. أنا سعيدة جداً!",
      badge: "بطلة التعاون 🏆",
    },
    {
      name: "والدة ياسمين",
      avatar: "👩",
      text: "منصة سند كانت بمثابة طوق النجاة لابنتي التي عانت من التنمر المدرسي. الأسلوب الذي يتعامل به الموقع مع الأطفال هادئ، آمن، ومريح جداً للأعصاب.",
      badge: "أم فخورة ❤️",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAFF]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 bg-gradient-to-b from-[#EBF8FF] to-white border-b-4 border-dashed border-gray-200">
        
        {/* Animated Background Icons */}
        <div className="absolute top-10 left-10 text-5xl opacity-20 animate-float-cloud">☁️</div>
        <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-float-cloud" style={{ animationDelay: '3s' }}>☁️</div>
        <div className="absolute top-32 right-12 text-3xl opacity-25 animate-bounce-subtle">🌸</div>
        <div className="absolute bottom-32 left-12 text-3xl opacity-25 animate-bounce-subtle" style={{ animationDelay: '1.5s' }}>⭐</div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          
          {/* Slogans & Action */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-right gap-6">
            
            <div className="inline-flex items-center gap-2 bg-[#FAF5FF] border-2 border-[#9F7AEA] px-4 py-1.5 rounded-full text-[#9F7AEA] font-extrabold text-sm animate-pulse-soft">
              <Heart className="w-4 h-4 fill-[#9F7AEA]" />
              <span>أنت لست وحدك، نحن دائماً معك ❤️</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#2D3748] leading-tight drop-shadow-sm">
              أهلاً بك في منصة <span className="text-[#63B3ED] underline decoration-[#F6E05E] decoration-8">سَنَدْ</span> 👋
            </h1>

            <p className="text-lg md:text-xl font-bold text-gray-500 max-w-xl leading-relaxed">
              مكانك السري والآمن لتتحدث بحرية تامة عن أي شيء يضايقك في المدرسة، أو مخاوفك، أو وحدتك. نحن نسمعك ونحبك!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-2">
              <Link
                href={user ? "/dashboard" : "/auth"}
                className="w-full sm:w-auto px-10 py-5 bg-[#63B3ED] text-white font-black text-xl md:text-2xl rounded-3xl border-4 border-[#2D3748] shadow-kids shadow-kids-hover transition-all duration-300 hover:bg-[#4299E1] text-center animate-pulse-soft"
              >
                احكي اللي مضايقك 🗣️
              </Link>
              
              <Link
                href="/videos"
                className="w-full sm:w-auto px-6 py-4 bg-white text-[#2D3748] font-extrabold text-base rounded-2xl border-3 border-[#2D3748] hover:bg-gray-50 text-center flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Play className="w-5 h-5 fill-[#9F7AEA] text-[#9F7AEA]" />
                <span>شاهد فيديوهات مفيدة</span>
              </Link>
            </div>

          </div>

          {/* Cartoon Character Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80 bg-[#FBB6CE] rounded-full border-4 border-[#2D3748] shadow-kids flex items-center justify-center animate-bounce-subtle" style={{ animationDuration: '4s' }}>
              <div className="text-9xl">👦</div>
              {/* Floating gold stars */}
              <div className="absolute -top-3 -right-3 text-4xl animate-bounce-subtle" style={{ animationDelay: '1s' }}>⭐</div>
              <div className="absolute -bottom-2 -left-2 text-4xl animate-bounce-subtle" style={{ animationDelay: '2s' }}>💫</div>
              <div className="absolute top-1/2 -left-6 bg-white border-3 border-[#2D3748] px-3 py-1.5 rounded-2xl text-xs font-black text-[#2D3748] rotate-[-12deg]">
                سند صديقك 🧡
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Daily Tip Section (Mood tracker interactive teaser) */}
      <section className="py-16 px-4 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-black text-[#2D3748] mb-2 flex items-center justify-center gap-2">
          <span>كيف تشعر اليوم يا بطل؟</span>
          <Smile className="w-7 h-7 text-[#9F7AEA]" />
        </h2>
        <p className="text-gray-500 font-bold mb-8">اختر إيموجي يمثلك لترى رسالة تشجيعية خاصة:</p>

        <div className="flex justify-center gap-4 md:gap-8 mb-8">
          {Object.keys(dailyTips).map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
              className={`w-16 h-16 md:w-20 md:h-20 text-4xl md:text-5xl rounded-2xl border-3 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md ${
                selectedEmoji === emoji
                  ? "bg-[#9F7AEA] border-[#2D3748] scale-110 rotate-6"
                  : "bg-white border-gray-200 hover:border-[#63B3ED] hover:scale-105 hover:-rotate-3"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Tip content animation */}
        {selectedEmoji ? (
          <div className="bg-[#FAF5FF] border-3 border-[#9F7AEA] p-6 rounded-3xl max-w-xl mx-auto shadow-kids animate-bounce-subtle" style={{ animationDuration: '0.5s' }}>
            <span className="text-4xl block mb-2">{selectedEmoji}</span>
            <p className="font-extrabold text-lg text-[#2D3748] leading-relaxed">
              {dailyTips[selectedEmoji]}
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-3xl max-w-xl mx-auto">
            <p className="font-bold text-gray-400">انقر على أحد الوجوه بالأعلى لنشاركك نصيحة سند اليومية 💡</p>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="bg-[#FAF5FF] py-16 px-4 border-t-4 border-b-4 border-[#2D3748]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-3">
            <h2 className="text-3xl font-black text-[#2D3748]">لماذا منصة سند هي صديقك الأوفى؟ 🧸</h2>
            <p className="text-gray-500 font-bold">لأننا بنينا مساحة تناسب الأطفال وتملؤها الألعاب والألوان والمكافآت المشجعة!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white border-3 border-[#2D3748] p-6 rounded-3xl shadow-kids hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl border-2 border-[#2D3748] flex items-center justify-center text-3xl mb-4 transform group-hover:rotate-12 transition-transform ${feat.color}`}>
                  {feat.icon}
                </div>
                <h3 className="font-black text-xl text-[#2D3748] mb-2">{feat.title}</h3>
                <p className="text-sm font-bold text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Embedded Safe Video Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="mb-10 flex flex-col gap-2">
          <span className="text-3xl">🎥</span>
          <h2 className="text-3xl font-black text-[#2D3748]">فيديو اليوم: لا للتنمر!</h2>
          <p className="text-gray-500 font-bold">شاهد هذا الفيديو الجميل لتتعلم كيف تكون واثقاً من نفسك وشجاعاً في مدرستك.</p>
        </div>

        <div className="relative rounded-3xl overflow-hidden border-4 border-[#2D3748] shadow-kids aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/oze4tQ63rvA?autoplay=0&rel=0"
            title="فيديو اليوم: لا للتنمر"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 px-4 border-t-4 border-dashed border-gray-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-3xl block mb-2">🌟</span>
            <h2 className="text-3xl font-black text-[#2D3748]">أصدقاؤنا الأبطال وعائلاتهم</h2>
            <p className="text-gray-500 font-bold">قصص حقيقية وتجارب سعيدة مر بها أصدقاء منصة سند.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="bg-[#FCFAFF] border-3 border-[#2D3748] p-6 rounded-3xl shadow-kids flex flex-col justify-between"
              >
                <div className="flex flex-col gap-4">
                  <span className="text-4xl text-right">“</span>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed -mt-3">{test.text}</p>
                </div>
                
                <div className="flex items-center gap-3 mt-6 border-t-2 border-dashed border-gray-200 pt-4">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#2D3748] flex items-center justify-center text-xl shadow-sm">
                    {test.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-[#2D3748]">{test.name}</span>
                    <span className="text-xs font-black text-[#9F7AEA] mt-0.5">{test.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Why Choose Sanad - SEO Content Section */}
      <section className="py-16 px-4 bg-[#F0FFF4] border-t-4 border-b-4 border-dashed border-green-300">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
            <h2 className="text-3xl font-black text-[#2D3748]">✨ منصة سند توفر مساحة أمان كاملة للأطفال</h2>
            <p className="text-gray-600 font-bold leading-relaxed">
              سند هي منصة متخصصة في دعم الأطفال نفسياً وتربوياً. نحن نساعدك على التعامل مع المشاكل الشائعة التي تواجه الطفل في حياته اليومية والمدرسية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            
            {/* Issue Cards */}
            <div className="bg-white border-3 border-[#2D3748] p-6 rounded-2xl shadow-kids hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="font-black text-lg text-[#2D3748] mb-2">مكافحة التنمر المدرسي</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                التنمر هو من أخطر المشاكل التي يواجهها الأطفال في المدرسة. تساعدك سند على فهم التنمر والتعامل معه بشجاعة وثقة.
              </p>
            </div>

            <div className="bg-white border-3 border-[#2D3748] p-6 rounded-2xl shadow-kids hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">😤</div>
              <h3 className="font-black text-lg text-[#2D3748] mb-2">التحكم بالغضب والعصبية</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                عندما تشعر بالغضب أو العصبية، قد تفقد السيطرة على تصرفاتك. نعلمك تقنيات للتحكم بالغضب والهدوء والاستقرار النفسي.
              </p>
            </div>

            <div className="bg-white border-3 border-[#2D3748] p-6 rounded-2xl shadow-kids hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="font-black text-lg text-[#2D3748] mb-2">الحماية من العنف والإساءة</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                إذا تعرضت للعنف أو الإساءة بأي شكل، سند موجودة لحمايتك والإبلاغ عن ذلك للجهات المختصة فوراً.
              </p>
            </div>

            <div className="bg-white border-3 border-[#2D3748] p-6 rounded-2xl shadow-kids hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">😢</div>
              <h3 className="font-black text-lg text-[#2D3748] mb-2">الدعم النفسي والعاطفي</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                الدعم النفسي مهم للأطفال. تحدث مع مرشدين متخصصين يفهمون مشاعرك ويساعدونك على الشعور بالأفضل.
              </p>
            </div>

            <div className="bg-white border-3 border-[#2D3748] p-6 rounded-2xl shadow-kids hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-black text-lg text-[#2D3748] mb-2">التواصل الاجتماعي الآمن</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                صداقات جديدة وتفاعل اجتماعي في مساحة آمنة. تعرف على أطفال آخرين يشاركونك نفس الاهتمامات والمشاعر.
              </p>
            </div>

            <div className="bg-white border-3 border-[#2D3748] p-6 rounded-2xl shadow-kids hover:shadow-lg transition-all">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-black text-lg text-[#2D3748] mb-2">التثقيف والتوعية</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                فيديوهات وموارد تعليمية تساعدك على فهم نفسك والعالم من حولك بشكل صحي وسليم.
              </p>
            </div>

          </div>

          {/* Additional Context */}
          <div className="bg-white border-3 border-[#2D3748] p-8 rounded-2xl text-center max-w-3xl mx-auto shadow-kids">
            <p className="text-gray-600 font-bold leading-relaxed text-lg">
              <span className="text-[#2D3748] font-black">منصة سند</span> هي صديقك الموثوق الذي يسمعك ويفهمك. 
              نحن نوفر مساحة آمنة وسرية 100% حيث يمكنك التحدث عن أي شيء يضايقك في المدرسة أو الحياة.
              سواء كنت تعاني من مشاكل اجتماعية، ضغط نفسي، أو مشاكل عائلية، نحن هنا لنساعدك ندعمك بكل محبة وحنان.
            </p>
          </div>

        </div>
      </section>

      {/* Call to Action Final banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#63B3ED] to-[#9F7AEA] border-t-4 border-[#2D3748] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-16 bg-white opacity-10 rounded-full blur-md"></div>
        <div className="max-w-xl mx-auto relative z-10 flex flex-col gap-6 items-center">
          <h2 className="text-3xl md:text-4xl font-black">جاهز للحديث يا بطل؟ 🤝</h2>
          <p className="font-extrabold text-base md:text-lg leading-relaxed opacity-95">
            سواء كنت تشعر بالخوف، أو بالضغط الدراسي، أو التنمر في المدرسة، منصة سند تفتح لك ذراعيها دائماً لتكون سندك وقوتك!
          </p>
          <Link
            href={user ? "/dashboard" : "/auth"}
            className="px-10 py-5 bg-[#F6E05E] text-[#2D3748] font-black text-xl md:text-2xl rounded-3xl border-4 border-[#2D3748] shadow-kids shadow-kids-hover hover:bg-[#FAF089] transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <span>ابدأ الآن واشكي مشكلتك</span>
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
