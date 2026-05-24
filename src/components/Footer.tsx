import React from "react";
import Link from "next/link";
import { Heart, Star, Shield, HelpCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t-4 border-[#2D3748] pt-12 pb-6 px-4 relative overflow-hidden">
      
      {/* Decorative cartoon clouds */}
      <div className="absolute top-0 left-5 w-16 h-8 bg-[#63B3ED] opacity-10 rounded-full blur-sm animate-float-cloud"></div>
      <div className="absolute top-8 right-10 w-24 h-12 bg-[#9F7AEA] opacity-10 rounded-full blur-sm animate-float-cloud" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b-2 border-dashed border-gray-200">
        
        {/* About column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#9F7AEA] flex items-center justify-center border-2 border-[#2D3748] shadow-sm">
              <span className="text-sm">🤝</span>
            </div>
            <span className="font-extrabold text-xl text-[#2D3748]">سَنَدْ | مساحة أمان</span>
          </div>
          <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-sm">
            نحن هنا من أجلك! سند هي مساحة دافئة وآمنة تتيح لك التعبير عن مشاعرك، وحل مشكلاتك المدرسية مثل الخوف أو التنمر مع مرشدين ودودين للغاية.
          </p>
        </div>

        {/* Dynamic educational columns */}
        <div className="flex flex-col gap-3">
          <span className="font-extrabold text-[#2D3748] text-lg">أقسام المنصة 🧸</span>
          <div className="grid grid-cols-2 gap-2 text-sm font-bold">
            <Link href="/" className="text-gray-500 hover:text-[#9F7AEA] transition-colors">الرئيسية</Link>
            <Link href="/videos" className="text-gray-500 hover:text-[#9F7AEA] transition-colors">فيديوهات مسلية</Link>
            <Link href="/talents" className="text-gray-500 hover:text-[#9F7AEA] transition-colors">معرض المواهب</Link>
            <Link href="/auth" className="text-gray-500 hover:text-[#9F7AEA] transition-colors">دخول الأطفال</Link>
            <Link href="/admin/login" className="text-gray-500 hover:text-[#9F7AEA] transition-colors">بوابة المشرفين</Link>
          </div>
        </div>

        {/* Safety Badge / Trust */}
        <div className="flex flex-col gap-3">
          <span className="font-extrabold text-[#2D3748] text-lg">مساحة آمنة 100% 🛡️</span>
          <div className="bg-[#EBF8FF] border-2 border-[#63B3ED] p-4 rounded-2xl flex items-start gap-3">
            <Shield className="w-8 h-8 text-[#63B3ED] flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-[#2B6CB0]">كل محادثاتك سرية</span>
              <span className="text-xs font-bold text-gray-500 mt-1">
                لا أحد يستطيع قراءة رسائلك أو مشكلاتك سوى المشرف المتخصص لمساعدتك فقط.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright area */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-extrabold text-gray-400">
        <span>جميع الحقوق محفوظة لموقع سند © 2026</span>
        <span className="flex items-center gap-1.5">
          صنع بكل
          <Heart className="w-3.5 h-3.5 fill-red-400 stroke-red-400 animate-pulse-soft" />
          من أجل أطفالنا الأبطال 🌟
        </span>
      </div>
    </footer>
  );
}
