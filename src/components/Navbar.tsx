"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, Star, Heart, Shield, Award } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLinkActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "فيديوهات مسلية", path: "/videos" },
    { name: "معرض المواهب", path: "/talents" },
  ];

  // Links visible only to logged-in children
  const privateLinks = [
    { name: "مساحتي الخاصة 🎒", path: "/dashboard" },
    { name: "دردشتي الآمنة 💬", path: "/chat" },
    { name: "لقاء زوم 🎥", path: "/booking" },
  ];

  const allLinks = user && profile?.role === "child" ? [...navLinks, ...privateLinks] : navLinks;

  return (
    <nav className="relative z-50 bg-white border-b-4 border-[#2D3748] px-4 py-3 md:py-4 shadow-kids">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and mascot */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-[#63B3ED] flex items-center justify-center border-3 border-[#2D3748] shadow-sm transform group-hover:rotate-12 transition-transform duration-300">
            <span className="text-2xl">🤝</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl md:text-3xl text-[#2D3748] tracking-wider flex items-center gap-1">
              سَنَدْ
              <span className="text-[#F6E05E] animate-bounce-subtle">★</span>
            </span>
            <span className="text-xs font-bold text-[#9F7AEA] -mt-1">مساحة أمان للأطفال ❤️</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-3">
          {allLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`px-4 py-2 rounded-2xl font-bold text-sm md:text-base transition-all duration-300 border-2 ${
                isLinkActive(link.path)
                  ? "bg-[#9F7AEA] text-white border-[#2D3748] translate-y-0.5 shadow-sm"
                  : "bg-[#FCFAFF] text-[#2D3748] border-transparent hover:bg-[#FBB6CE] hover:border-[#2D3748] hover:-translate-y-0.5 shadow-sm"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {/* Direct link for admin if authenticated */}
          {user && profile?.role === "admin" && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-2xl font-bold text-sm bg-[#68D391] text-white border-2 border-[#2D3748] shadow-sm hover:-translate-y-0.5 transition-all duration-300"
            >
              بوابة الإدارة 🔐
            </Link>
          )}
        </div>

        {/* User profile & action buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {profile?.role === "child" && (
                <div className="flex items-center gap-2 bg-[#F6E05E] border-3 border-[#2D3748] px-3 py-1.5 rounded-2xl shadow-sm text-sm font-extrabold text-[#2D3748] animate-bounce-subtle">
                  <Star className="w-4 h-4 fill-white stroke-white" />
                  <span>{profile.stars} نجوم</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-[#FCFAFF] border-2 border-cartoon-soft px-3 py-1.5 rounded-2xl">
                <div className="w-7 h-7 rounded-full bg-[#FBB6CE] border border-[#2D3748] flex items-center justify-center text-xs">
                  {profile?.role === "admin" ? "👮" : "👦"}
                </div>
                <span className="font-bold text-sm text-[#2D3748] max-w-[120px] truncate">
                  {profile?.name || "صديق سند"}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 bg-red-100 text-red-600 rounded-xl border-2 border-transparent hover:border-[#2D3748] hover:bg-red-200 transition-all duration-300 cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="px-5 py-2.5 bg-[#9F7AEA] text-white font-extrabold text-sm rounded-2xl border-3 border-[#2D3748] shadow-kids shadow-kids-hover transition-all duration-300 hover:bg-[#B794F4]"
              >
                دخول الأطفال 🎒
              </Link>
              <Link
                href="/admin/login"
                className="px-4 py-2.5 bg-white text-[#2D3748] font-bold text-xs rounded-xl border-2 border-[#2D3748] hover:bg-gray-50 transition-all duration-300"
              >
                بوابة المشرف 🔐
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          {user && profile?.role === "child" && (
            <div className="flex items-center gap-1 bg-[#F6E05E] border-2 border-[#2D3748] px-2.5 py-1 rounded-xl text-xs font-extrabold text-[#2D3748]">
              <Star className="w-3.5 h-3.5 fill-white stroke-white" />
              <span>{profile.stars}</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border-2 border-[#2D3748] bg-[#FCFAFF] text-[#2D3748] hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 p-4 bg-white border-4 border-[#2D3748] rounded-3xl shadow-lg flex flex-col gap-2 animate-bounce-subtle" style={{ animationDuration: '0.4s' }}>
          {allLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl font-bold text-center border-2 transition-all ${
                isLinkActive(link.path)
                  ? "bg-[#9F7AEA] text-white border-[#2D3748]"
                  : "bg-gray-50 text-[#2D3748] border-transparent hover:bg-[#FBB6CE] hover:border-[#2D3748]"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user && profile?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-bold text-center bg-[#68D391] text-white border-2 border-[#2D3748]"
            >
              بوابة الإدارة 🔐
            </Link>
          )}

          {/* User profile details for mobile */}
          <div className="border-t-2 border-[#2D3748] mt-2 pt-3 flex flex-col gap-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-gray-50 border-2 border-cartoon-soft px-3 py-2 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{profile?.role === "admin" ? "👮" : "👦"}</span>
                    <span className="font-bold text-[#2D3748] text-sm">{profile?.name}</span>
                  </div>
                  {profile?.role === "child" && (
                    <span className="text-xs bg-[#F6E05E] px-2 py-0.5 rounded-lg border border-[#2D3748] font-bold">
                      ⭐ {profile.stars} نجمة
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-red-100 text-red-600 font-bold rounded-xl border-2 border-transparent hover:border-[#2D3748] flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-[#9F7AEA] text-white font-extrabold text-center rounded-2xl border-3 border-[#2D3748] shadow-sm"
                >
                  دخول الأطفال 🎒
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-gray-100 text-[#2D3748] text-xs font-bold text-center rounded-xl border-2 border-gray-300"
                >
                  بوابة المشرف 🔐
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
