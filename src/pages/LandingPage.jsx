import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Store, Layers, Zap } from "lucide-react";

const injectStyles = () => {
  const id = "landing-page-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes fl-a{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(30px,-20px) rotate(120deg)}66%{transform:translate(-15px,15px) rotate(240deg)}}
    @keyframes fl-b{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(-25px,25px) rotate(-120deg)}66%{transform:translate(20px,-10px) rotate(-240deg)}}
    @keyframes fl-c{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(10px,-30px) scale(1.1)}}
    @keyframes slide-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fade-in{from{opacity:0}to{opacity:1}}
    @keyframes pulse-ring{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.2);opacity:0}}
    .anim-su{animation:slide-up .7s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .anim-fi{animation:fade-in .5s ease forwards;opacity:0}
    .fl-a{animation:fl-a 14s ease-in-out infinite}
    .fl-b{animation:fl-b 17s ease-in-out infinite}
    .fl-c{animation:fl-c 11s ease-in-out infinite}
    .pulse-ring{animation:pulse-ring 2s cubic-bezier(0,0,.2,1) infinite}
  `;
  document.head.appendChild(s);
};

const features = [
  { icon: Store, title: "Curated Stores", desc: "Browse unique print shops with distinct brand identities" },
  { icon: Layers, title: "Premium Products", desc: "Business cards, banners, apparel — all professional grade" },
  { icon: Zap, title: "Fast Turnaround", desc: "Order online, get your prints delivered on time" },
];

const LandingPage = () => {
  const [slug, setSlug] = useState("");
  const [focused, setFocused] = useState(false);
  const [hoveredChip, setHoveredChip] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { injectStyles(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = slug.trim().toLowerCase();
    if (!val) return;
    navigate(`/store/${val}`);
  };

  const fillSlug = (name) => {
    setSlug(name);
    inputRef.current?.focus();
  };

  const hasValue = slug.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="fl-a absolute -top-[15%] -left-[10%] w-[650px] h-[650px] rounded-full bg-[#c2410c]/10 dark:bg-[#c2410c]/5 blur-[140px]"/>
        <div className="fl-b absolute -bottom-[12%] -right-[10%] w-[550px] h-[550px] rounded-full bg-[#92400e]/10 dark:bg-[#92400e]/5 blur-[120px]"/>
        <div className="fl-c absolute top-[40%] left-[55%] w-[350px] h-[350px] rounded-full bg-[#fbbf24]/5 dark:bg-[#fbbf24]/[0.02] blur-[90px]"/>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(28,25,23,.035) 1px, transparent 0)", backgroundSize: "32px 32px" }}/>
        <div className="fl-a absolute top-[12%] right-[18%] w-3 h-3 rounded-full bg-[#f97316]/25 dark:bg-[#f97316]/10"/>
        <div className="fl-b absolute top-[25%] left-[12%] w-2 h-2 rounded-full bg-[#c2410c]/20 dark:bg-[#c2410c]/10"/>
        <div className="fl-c absolute bottom-[30%] right-[25%] w-4 h-4 rounded-sm bg-[#ea580c]/10 dark:bg-[#ea580c]/5 rotate-45"/>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#faf9f6] dark:from-stone-950 to-transparent"/>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        <div className="anim-su flex items-center gap-3 mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-40 dark:opacity-20 scale-110"/>
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-xl shadow-orange-600/20 dark:shadow-orange-600/10">
              <Sparkles className="w-6 h-6 text-white"/>
            </div>
          </div>
        </div>

        <h1 className="anim-su text-center text-4xl sm:text-5xl md:text-6xl font-black text-[#1c1917] dark:text-stone-100 leading-[1.08] tracking-tight" style={{ animationDelay: ".1s" }}>
          Welcome to<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#f97316]">
            PrintFlow
          </span>
        </h1>

        <p className="anim-su mt-5 text-stone-500 dark:text-stone-400 text-center max-w-md text-[15px] sm:text-base leading-relaxed" style={{ animationDelay: ".18s" }}>
          Discover premium print stores and order custom designs effortlessly. Enter a store name below to get started.
        </p>

        <form onSubmit={handleSubmit} className={`anim-su mt-10 w-full relative transition-all duration-500 ${focused ? "scale-[1.02]" : "scale-100"}`} style={{ animationDelay: ".26s" }}>
          <div className={`absolute -inset-1 rounded-[1.35rem] bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#f97316] opacity-0 blur-xl transition-opacity duration-500 ${focused ? "opacity-25 dark:opacity-15" : "opacity-0"}`}/>
          <div className={`relative flex bg-white dark:bg-stone-900 rounded-2xl border overflow-hidden transition-all duration-300 shadow-lg
            ${focused ? "border-[#c2410c]/30 dark:border-[#c2410c]/50 shadow-xl shadow-orange-100/50 dark:shadow-orange-900/20" : "border-stone-200/80 dark:border-stone-700 shadow-stone-200/40 dark:shadow-black/20"}`}>
            <div className={`flex items-center pl-5 transition-colors duration-300 ${focused ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"}`}>
              <Store className="w-5 h-5"/>
            </div>
            <input ref={inputRef} type="text" placeholder="Enter store name (e.g. avillas)" value={slug} onChange={(e) => setSlug(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" spellCheck={false}
              className="flex-1 px-4 py-5 bg-transparent outline-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 text-base sm:text-[17px] font-medium"/>
            <button type="submit" disabled={!hasValue}
              className={`m-2 px-6 sm:px-8 font-bold rounded-xl flex items-center gap-2 transition-all duration-300 text-sm sm:text-[15px]
                ${hasValue ? "bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white hover:shadow-lg hover:shadow-orange-600/25 dark:hover:shadow-orange-600/40 active:scale-[.97]" : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed"}`}>
              Visit <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${hasValue ? "translate-x-0.5" : ""}`}/>
            </button>
          </div>
          {hasValue && (
            <div className="anim-fi mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 font-mono">
              <span className="text-stone-300 dark:text-stone-600">printflow.app/store/</span>
              <span className="text-[#c2410c] font-semibold">{slug.trim().toLowerCase()}</span>
            </div>
          )}
        </form>

        <div className="anim-su mt-7 flex items-center gap-2.5 flex-wrap justify-center" style={{ animationDelay: ".34s" }}>
          <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold tracking-wide">Try:</span>
          {[{ slug: "avillas", label: "Avillas" }, { slug: "majei", label: "Majei" }].map((item) => (
            <button key={item.slug} type="button" onClick={() => fillSlug(item.slug)} onMouseEnter={() => setHoveredChip(item.slug)} onMouseLeave={() => setHoveredChip(null)}
              className={`group relative px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300
                ${hoveredChip === item.slug ? "bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 shadow-lg shadow-stone-900/15 dark:shadow-white/10 scale-105" : "bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm border border-stone-200/60 dark:border-stone-700/60 text-stone-500 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 shadow-sm"}`}>
              {item.label}
              <ArrowRight className={`inline-block w-3 h-3 ml-1 transition-all duration-200 ${hoveredChip === item.slug ? "translate-x-0.5 opacity-100" : "-translate-x-1 opacity-0"}`}/>
            </button>
          ))}
        </div>

        <div className="anim-su mt-16 w-full grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ animationDelay: ".42s" }}>
          {features.map((f) => (
            <div key={f.title} className="group relative bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/40 rounded-2xl p-5 hover:bg-white dark:hover:bg-stone-900 hover:border-[#c2410c]/15 dark:hover:border-[#c2410c]/30 hover:shadow-xl hover:shadow-orange-100/30 dark:hover:shadow-orange-900/20 transition-all duration-500 cursor-default">
              <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4 group-hover:bg-[#fff7ed] dark:group-hover:bg-[#c2410c]/10 group-hover:border-[#c2410c]/15 transition-all duration-300">
                <f.icon className="w-[18px] h-[18px] text-stone-400 dark:text-stone-500 group-hover:text-[#c2410c] transition-colors duration-300"/>
              </div>
              <h3 className="font-bold text-stone-800 dark:text-stone-200 text-sm">{f.title}</h3>
              <p className="text-stone-400 dark:text-stone-500 text-xs mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 flex items-center gap-2.5 text-[11px] text-stone-400 dark:text-stone-600 z-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#c2410c] opacity-50"/>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c2410c]"/>
        </span>
        Storefront platform by PrintFlow
      </div>
    </div>
  );
};

export default LandingPage;