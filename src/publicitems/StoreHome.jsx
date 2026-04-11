import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "@/api/api";
import { Package, Folder, Search, ArrowRight, X, ChevronUp } from "lucide-react";

const injectStyles = () => {
  const id = "store-home-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes float-a{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(30px,-20px) rotate(120deg)}66%{transform:translate(-15px,15px) rotate(240deg)}}
    @keyframes float-b{0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(-25px,25px) rotate(-120deg)}66%{transform:translate(20px,-10px) rotate(-240deg)}}
    @keyframes float-c{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(10px,-30px) scale(1.1)}}
    @keyframes slide-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fade-in{from{opacity:0}to{opacity:1}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes card-in{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    .anim-slide-up{animation:slide-up .65s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .anim-fade-in{animation:fade-in .4s ease forwards;opacity:0}
    .anim-card{animation:card-in .55s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .fl-a{animation:float-a 12s ease-in-out infinite}
    .fl-b{animation:float-b 15s ease-in-out infinite}
    .fl-c{animation:float-c 10s ease-in-out infinite}
    .shimmer-bg{background:linear-gradient(90deg,transparent 25%,rgba(255,255,255,.07) 50%,transparent 75%);background-size:200% 100%;animation:shimmer 2.8s infinite}
    .img-ph{background:linear-gradient(135deg,#e7e5e4 0%,#d6d3d1 50%,#e7e5e4 100%);background-size:200% 200%;animation:shimmer 2.5s infinite}
    .dark .img-ph{background:linear-gradient(135deg,#292524 0%,#1c1917 50%,#292524 100%);background-size:200% 200%}
    .scrollbar-hide::-webkit-scrollbar{display:none}
    .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
    .cat-pill{transition:left .38s cubic-bezier(.16,1,.3,1),width .38s cubic-bezier(.16,1,.3,1)}
    .tilt-card{transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s ease;transform-style:preserve-3d;will-change:transform}
    .btt{transition:opacity .3s ease,transform .3s ease}
  `;
  document.head.appendChild(s);
};

const useCountUp = (target, duration = 900) => {
  const [v, setV] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !target) return;
    done.current = true;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setV(target); clearInterval(id); }
      else setV(cur);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return v;
};

const StoreHome = () => {
  const { companySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showBTT, setShowBTT] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const catBarRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });
  const navigate = useNavigate();

  useEffect(() => { injectStyles(); }, []);
  
  useEffect(() => {
    const go = async () => {
      try {
        setLoading(true);
        const [p, c] = await Promise.all([productsAPI.getPublic({ company: companySlug }), productsAPI.getPublicCategories({ company: companySlug })]);
        setProducts(p.data.results || p.data);
        setCategories(c.data.results || c.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (companySlug) go();
  }, [companySlug]);

  useEffect(() => {
    if (!catBarRef.current || loading) return;
    const t = setTimeout(() => {
      const btns = catBarRef.current.querySelectorAll("[data-cb]");
      const el = !activeCategory ? btns[0] : [...btns].find((b) => b.dataset.cid === String(activeCategory));
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    }, 40);
    return () => clearTimeout(t);
  }, [activeCategory, categories, loading]);

  useEffect(() => { const h = () => setShowBTT(window.scrollY > 500); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { setFilterKey((k) => k + 1); }, [activeCategory, search]);

  const filtered = products.filter((p) => {
    const mc = activeCategory ? p.category_id === activeCategory : true;
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const prodCount = useCountUp(products.length);
  const catCount = useCountUp(categories.length);

  const onTilt = useCallback((e) => {
    const el = e.currentTarget; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.03)`;
  }, []);
  const offTilt = useCallback((e) => { e.currentTarget.style.transform = ""; }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col transition-colors duration-300">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#faf9f6]/80 dark:bg-stone-950/80 backdrop-blur-2xl border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} aria-label="Back" className="shrink-0 w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors active:scale-95">
            <svg className="w-4 h-4 text-stone-600 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/20 dark:shadow-orange-600/10">
              <span className="text-white text-sm font-black">{companySlug?.charAt(0)?.toUpperCase()}</span>
            </div>
            <span className="font-bold text-stone-900 dark:text-stone-100 text-lg capitalize tracking-tight hidden sm:inline">{companySlug}</span>
          </div>
          <div className="hidden md:block relative flex-1 max-w-sm">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? "text-[#c2410c]" : "text-stone-400 dark:text-stone-500"}`}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search products..."
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white dark:bg-stone-900 border outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all duration-300
                ${searchFocused ? "border-[#c2410c]/40 dark:border-[#c2410c]/60 ring-4 ring-[#c2410c]/10 dark:ring-[#c2410c]/20 shadow-lg shadow-orange-100/50 dark:shadow-orange-900/20 text-stone-800 dark:text-stone-100" : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 text-stone-800 dark:text-stone-200"}`}/>
            {search && (<button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"><X className="w-3 h-3 text-stone-500 dark:text-stone-400"/></button>)}
          </div>
          <button onClick={() => document.getElementById("mob-search")?.focus()} className="md:hidden shrink-0 w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors active:scale-95">
            <Search className="w-4 h-4 text-stone-600 dark:text-stone-300"/>
          </button>
        </div>
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500"/>
            <input id="mob-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-[#c2410c]/40 focus:ring-4 focus:ring-[#c2410c]/10 transition-all text-stone-800 dark:text-stone-200"/>
            {search && (<button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center"><X className="w-3 h-3 text-stone-500 dark:text-stone-400"/></button>)}
          </div>
        </div>
      </header>

      {/* HERO (Always dark) */}
      <section className="relative overflow-hidden bg-[#1c1917]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="fl-a absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#c2410c]/20 blur-[90px]"/>
          <div className="fl-b absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#92400e]/15 blur-[70px]"/>
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,.04) 1px,transparent 0)", backgroundSize: "32px 32px" }}/>
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#1c1917] to-transparent"/>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="anim-slide-up inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[.06] border border-white/[.08] mb-6">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f97316] opacity-60"/><span className="relative inline-flex rounded-full h-2 w-2 bg-[#f97316]"/></span>
              <span className="text-[11px] text-stone-400 font-semibold tracking-widest uppercase">Open for orders</span>
            </div>
            <h1 className="anim-slide-up text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.08] tracking-tight" style={{ animationDelay: ".1s" }}>Premium Print<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#fb923c] to-[#fbbf24]">Products &amp; Design</span></h1>
            <p className="anim-slide-up text-stone-400 mt-6 text-base sm:text-lg leading-relaxed max-w-md" style={{ animationDelay: ".2s" }}>Browse our curated collection of high-quality print products. Fast turnaround, professional finish.</p>
            <div className="anim-slide-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: ".3s" }}>
              <button onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white text-sm font-bold rounded-xl hover:shadow-xl hover:shadow-orange-600/25 active:scale-[.97] transition-all duration-300">Browse Collection <ArrowRight className="w-4 h-4"/></button>
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[.06] border border-white/[.08] text-stone-300 text-sm font-medium"><span className="text-[#f97316] font-bold text-base tabular-nums">{prodCount}</span> Products</div>
            </div>
          </div>
          <div className="anim-slide-up hidden md:flex items-center gap-8 mt-14" style={{ animationDelay: ".4s" }}>
            {[{ icon: Package, value: prodCount, label: "Products" }, { icon: Folder, value: catCount, label: "Categories" }].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="w-px h-10 bg-white/[.08]"/>}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[.06] border border-white/[.08] flex items-center justify-center"><s.icon className="w-5 h-5 text-[#f97316]"/></div>
                  <div><p className="text-2xl font-black text-white tabular-nums">{s.value}</p><p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-[.15em] font-semibold">{s.label}</p></div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1" id="products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16">
          {!loading && categories.length > 0 && (
            <div className="anim-slide-up sticky top-16 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-[#faf9f6]/90 dark:bg-stone-950/90 backdrop-blur-xl" style={{ animationDelay: ".05s" }}>
              <div ref={catBarRef} className="relative flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-white dark:bg-stone-900 rounded-2xl p-1.5 shadow-sm shadow-stone-200/50 dark:shadow-black/20 border border-stone-200/60 dark:border-stone-700/50">
                <div className="cat-pill absolute top-1.5 bottom-1.5 bg-[#1c1917] dark:bg-white rounded-xl z-0" style={pill}/>
                <button data-cb data-cid="all" onClick={() => setActiveCategory(null)} className={`relative z-10 shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors duration-200 ${!activeCategory ? "text-white dark:text-stone-900" : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"}`}>All Products</button>
                {categories.map((c) => (
                  <button key={c.id} data-cb data-cid={c.id} onClick={() => setActiveCategory(c.id)} className={`relative z-10 shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-colors duration-200 ${activeCategory === c.id ? "text-white dark:text-stone-900" : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"}`}>
                    <Folder className="w-3.5 h-3.5"/>{c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="anim-fade-in rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900" style={{ animationDelay: `${i * .05}s` }}>
                    <div className="aspect-[4/3] img-ph"/><div className="p-4 space-y-3"><div className="h-4 rounded-lg bg-stone-100 dark:bg-stone-800"/><div className="h-3 rounded-lg bg-stone-50 dark:bg-stone-800 w-3/4"/><div className="flex justify-between items-center pt-2"><div className="h-5 rounded-lg bg-stone-100 dark:bg-stone-800 w-20"/><div className="h-7 rounded-lg bg-stone-100 dark:bg-stone-800 w-16"/></div></div>
                  </div>
                ))}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="anim-slide-up text-center py-24">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="relative"><div className="w-20 h-20 rounded-3xl bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 flex items-center justify-center"><Package className="w-8 h-8 text-stone-300 dark:text-stone-600"/></div></div>
                  <div><p className="text-stone-700 dark:text-stone-300 font-bold text-base">No products found</p><p className="text-stone-400 dark:text-stone-500 text-sm mt-1.5">{search ? `No results for "${search}"` : "This category has no products yet"}</p></div>
                  {(search || activeCategory) && (<button onClick={() => { setSearch(""); setActiveCategory(null); }} className="mt-1 text-sm font-semibold text-[#c2410c] hover:text-[#ea580c] transition-colors">Clear filters</button>)}
                </div>
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <>
                <div className="anim-fade-in flex items-center justify-between mb-6">
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold tracking-wide"><span className="text-stone-600 dark:text-stone-300">{filtered.length}</span> product{filtered.length !== 1 && "s"}</p>
                  {(search || activeCategory) && (<button onClick={() => { setSearch(""); setActiveCategory(null); }} className="text-xs font-semibold text-stone-400 dark:text-stone-500 hover:text-[#c2410c] transition-colors flex items-center gap-1"><X className="w-3 h-3"/> Clear filter</button>)}
                </div>
                <div key={filterKey} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {filtered.map((p, i) => (
                    <div key={p.id} className="tilt-card anim-card group bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-[#c2410c]/15 dark:hover:border-[#c2410c]/30 hover:shadow-2xl hover:shadow-orange-100/40 dark:hover:shadow-orange-900/20 cursor-pointer overflow-hidden" style={{ animationDelay: `${i * .06}s` }} onClick={() => navigate(`/store/${companySlug}/product/${p.id}`)} onMouseMove={onTilt} onMouseLeave={offTilt}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-stone-50 dark:bg-stone-800">
                        {p.image ? (<img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"/>) : (<div className="img-ph w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-stone-300 dark:text-stone-600"/></div>)}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"><div className="w-11 h-11 rounded-full bg-white/95 dark:bg-stone-800/95 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10 scale-75 group-hover:scale-100 transition-transform duration-300"><ArrowRight className="w-5 h-5 text-[#1c1917] dark:text-stone-100"/></div></div>
                        {p.category_name && (<div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">{p.category_name}</div>)}
                      </div>
                      <div className="p-3.5 sm:p-4">
                        <h3 className="font-bold text-stone-800 dark:text-stone-200 text-[13px] sm:text-sm leading-snug group-hover:text-[#c2410c] transition-colors line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                        {p.description && (<p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5 line-clamp-1">{p.description}</p>)}
                        <div className="flex items-end justify-between mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                          <span className="font-black text-stone-900 dark:text-stone-100 text-sm sm:text-[15px] tracking-tight">KES {p.price?.toLocaleString()}</span>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/store/${companySlug}/product/${p.id}`); }} className="flex items-center gap-1 text-[11px] font-bold px-3 py-2 bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 rounded-xl hover:bg-[#c2410c] dark:hover:bg-[#c2410c] dark:hover:text-white active:scale-95 transition-all duration-200 shadow-sm shadow-stone-900/10 dark:shadow-black/20">View <ArrowRight className="w-3 h-3"/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center"><span className="text-white text-[10px] font-black">{companySlug?.charAt(0)?.toUpperCase()}</span></div><p className="text-xs text-stone-400 dark:text-stone-500">&copy; {new Date().getFullYear()} <span className="font-semibold text-stone-600 dark:text-stone-300 capitalize">{companySlug}</span>. All rights reserved.</p></div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-stone-600"><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c2410c] opacity-50"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c2410c]"/></span>Powered by PrintHub</div>
        </div>
      </footer>

      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className={`btt fixed bottom-6 right-6 z-50 w-11 h-11 rounded-xl bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 shadow-xl shadow-stone-900/20 dark:shadow-white/10 flex items-center justify-center hover:bg-[#c2410c] dark:hover:bg-[#c2410c] dark:hover:text-white active:scale-90 transition-all duration-300 ${showBTT ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}><ChevronUp className="w-5 h-5"/></button>
    </div>
  );
};

export default StoreHome;