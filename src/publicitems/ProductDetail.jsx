import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPublicProduct } from "@/store/slices/productsSlice";
import {Package,ArrowRight,ArrowLeft,ShoppingCart,Clock,Layers,CheckCircle,Info,ZoomIn,} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const injectStyles = () => {
  const id = "product-detail-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes pd-su{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pd-fi{from{opacity:0}to{opacity:1}}
    @keyframes pd-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes pd-img{from{opacity:0;transform:scale(1.08)}to{opacity:1;transform:scale(1)}}
    @keyframes pd-price{0%{opacity:0;transform:translateY(12px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes pd-check{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
    .pd-su{animation:pd-su .65s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .pd-fi{animation:pd-fi .5s ease forwards;opacity:0}
    .pd-img-ph{background:linear-gradient(135deg,#e7e5e4 0%,#d6d3d1 50%,#e7e5e4 100%);background-size:200% 200%;animation:pd-shimmer 2.5s infinite}
    .dark .pd-img-ph{background:linear-gradient(135deg,#292524 0%,#1c1917 50%,#292524 100%);background-size:200% 200%}
    .pd-img-reveal{animation:pd-img .8s cubic-bezier(.16,1,.3,1) forwards}
    .pd-price-pop{animation:pd-price .6s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
    .pd-check-in{animation:pd-check .4s cubic-bezier(.16,1,.3,1) forwards;opacity:0}
  `;
  document.head.appendChild(s);
};

const StoreHeader = ({ companySlug, navigate, backTo, backLabel }) => (
  <header className="sticky top-0 z-50 bg-[#faf9f6]/80 dark:bg-stone-950/80 backdrop-blur-2xl border-b border-stone-200/60 dark:border-stone-800/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <button onClick={() => navigate(backTo || -1)} className="flex items-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors active:scale-95">
        <span className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </span>
        <span className="hidden sm:inline">{backLabel || "Back"}</span>
      </button>
      <button onClick={() => navigate(`/store/${companySlug}`)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/20 dark:shadow-orange-600/10">
          <span className="text-white text-sm font-black">{companySlug?.charAt(0)?.toUpperCase()}</span>
        </div>
        <span className="font-bold text-stone-900 dark:text-stone-100 text-lg capitalize tracking-tight">{companySlug}</span>
      </button>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="w-[88px] sm:w-auto" />
      </div>
    </div>
  </header>
);

const LoadingSkeleton = ({ companySlug, navigate }) => (
  <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col transition-colors duration-300">
    <StoreHeader companySlug={companySlug} navigate={navigate} backTo={`/store/${companySlug}`} backLabel="Back to Store" />
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-[4/5] md:aspect-square rounded-3xl pd-img-ph" />
        <div className="flex flex-col justify-center gap-5 py-4">
          <div className="h-8 w-32 rounded-xl pd-img-ph" />
          <div className="h-12 w-full rounded-2xl pd-img-ph" />
          <div className="h-12 w-3/4 rounded-2xl pd-img-ph" />
          <div className="h-4 w-48 rounded-lg pd-img-ph" />
          <div className="h-20 w-full rounded-xl pd-img-ph" />
          <div className="h-32 rounded-2xl pd-img-ph" />
          <div className="h-4 w-24 rounded-lg pd-img-ph" />
          <div className="h-14 w-full rounded-xl pd-img-ph" />
        </div>
      </div>
    </div>
  </div>
);

const NotFoundState = ({ companySlug, navigate }) => (
  <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col transition-colors duration-300">
    <StoreHeader companySlug={companySlug} navigate={navigate} backTo={`/store/${companySlug}`} backLabel="Back to Store" />
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="pd-su text-center max-w-sm">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-3xl bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 flex items-center justify-center">
            <Package className="w-10 h-10 text-stone-300 dark:text-stone-600" />
          </div>
        </div>
        <h2 className="text-stone-800 dark:text-stone-200 font-black text-2xl tracking-tight">Product not found</h2>
        <p className="text-stone-400 dark:text-stone-500 text-sm mt-3 leading-relaxed">The product you're looking for might have been removed or is temporarily unavailable.</p>
        <button onClick={() => navigate(`/store/${companySlug}`)} className="mt-8 inline-flex items-center gap-2.5 text-sm font-bold px-7 py-3.5 bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 rounded-xl
         hover:bg-[#c2410c] dark:hover:bg-[#c2410c] dark:hover:text-white active:scale-[.97] transition-all duration-200 shadow-lg shadow-stone-900/15 dark:shadow-white/10">
          <ArrowLeft className="w-4 h-4" />Back to Store
        </button>
      </div>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id, companySlug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: p, isLoading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => {
    if (id && companySlug) dispatch(fetchPublicProduct(id));;
    window.scrollTo(0, 0);
    setImgLoaded(false);
  }, [dispatch, id, companySlug]);

  const handleOrder = () => {
    if (!user) navigate(`/store/${companySlug}/login/`);
    else navigate("/app/orders/new", { state: { product: p, companySlug } });
  };

  if (isLoading) return <LoadingSkeleton companySlug={companySlug} navigate={navigate} />;
  if (!p) return <NotFoundState companySlug={companySlug} navigate={navigate} />;

  const details = p.details ? p.details.split("\n").filter(Boolean) : [];
  const hasExtras = p.production_time || p.min_quantity;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col transition-colors duration-300">
      <StoreHeader companySlug={companySlug} navigate={navigate} backTo={`/store/${companySlug}`} backLabel="Back to Store" />

      <main className="flex-1 pb-28 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">

            {/* IMAGE */}
            <div className="pd-su">
              <div className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-xl shadow-stone-200/40 dark:shadow-black/20 group cursor-zoom-in" onClick={() => setImgZoomed(true)}>
                <div className="relative aspect-[4/5] md:aspect-square overflow-hidden">
                  {!imgLoaded && <div className="absolute inset-0 pd-img-ph" />}
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      onLoad={() => setImgLoaded(true)}
                      className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${imgLoaded ? "pd-img-reveal" : "opacity-0"}`}
                    />
                  )}
                  {!p.image && imgLoaded && (
                    <div className="absolute inset-0 pd-img-ph flex items-center justify-center">
                      <Package className="w-12 h-12 text-stone-300 dark:text-stone-600" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-black/5">
                    <ZoomIn className="w-4 h-4 text-stone-700 dark:text-stone-200" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#c2410c] shadow-md shadow-orange-100/50 dark:shadow-orange-900/30">
                  {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full pd-img-ph" />}
                </div>
                {details.length > 0 && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 flex items-center justify-center text-stone-400 dark:text-stone-500">
                    <span className="text-[10px] font-bold text-center leading-tight px-1">{details.length}<br />features</span>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex flex-col justify-center">
              {p.category && (
                <div className="pd-su inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff7ed] dark:bg-[#c2410c]/10 border border-[#c2410c]/15 dark:border-[#c2410c]/20" style={{ animationDelay: ".05s" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                  <span className="text-[11px] text-[#c2410c] font-bold tracking-wider uppercase">{p.category}</span>
                </div>
              )}

              <h1 className="pd-su text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-[#1c1917] dark:text-stone-100 leading-[1.08] tracking-tight mt-4" style={{ animationDelay: ".1s" }}>
                {p.name}
              </h1>

              {hasExtras && (
                <div className="pd-su flex flex-wrap items-center gap-2.5 mt-5" style={{ animationDelay: ".15s" }}>
                  {p.production_time && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300">
                      <Clock className="w-3.5 h-3.5 text-[#c2410c]" />{p.production_time}h Turnaround
                    </div>
                  )}
                  {p.min_quantity && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300">
                      <Layers className="w-3.5 h-3.5 text-[#92400e]" />Min. {p.min_quantity} pcs
                    </div>
                  )}
                </div>
              )}

              <p className="pd-su text-stone-500 dark:text-stone-400 mt-6 text-[15px] sm:text-base leading-relaxed" style={{ animationDelay: ".2s" }}>
                {p.description || "No description available for this product."}
              </p>

              {/* Price card */}
              <div className="pd-su mt-8 relative self-start w-full sm:w-auto" style={{ animationDelay: ".28s" }}>
                <div className="absolute -inset-px rounded-[1.15rem] bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#f97316] opacity-20 dark:opacity-30 blur-sm" />
                <div className="relative p-5 sm:p-6 bg-[#1c1917] dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 dark:border-stone-700">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#c2410c]/15 blur-2xl rounded-full -translate-y-1/2 translate-x-1/3" />
                  <div className="relative">
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-[.18em] font-bold">Starting from</p>
                    <div className="pd-price-pop mt-2 flex items-baseline gap-1.5" style={{ animationDelay: ".4s" }}>
                      <span className="text-sm font-bold text-stone-400 dark:text-stone-500">KES</span>
                      <span className="text-4xl sm:text-5xl font-black text-white dark:text-stone-100 tracking-tight tabular-nums">{p.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features list */}
              {details.length > 0 && (
                <div className="pd-su mt-8" style={{ animationDelay: ".35s" }}>
                  <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[.15em] mb-4">Features &amp; Details</h3>
                  <div className="space-y-3">
                    {details.map((line, i) => (
                      <div key={i} className="pd-check-in flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300" style={{ animationDelay: `${.4 + i * .07}s` }}>
                        <div className="mt-0.5 w-5 h-5 rounded-md bg-[#fff7ed] dark:bg-[#c2410c]/10 border border-[#c2410c]/15 dark:border-[#c2410c]/20 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3 h-3 text-[#c2410c]" />
                        </div>
                        <span className="leading-relaxed">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop CTA */}
              <div className="hidden md:block pd-su mt-10" style={{ animationDelay: ".5s" }}>
                <button onClick={handleOrder} className="group relative inline-flex items-center gap-3 text-[15px] font-bold px-10 py-4 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-2xl hover:shadow-2xl hover:shadow-orange-600/25 dark:hover:shadow-orange-600/40 active:scale-[.97] transition-all duration-300 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-[#ea580c] to-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <ShoppingCart className="relative w-5 h-5" />
                  <span className="relative">Select Design Now</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                {!user && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                    <Info className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />You will be prompted to log in before ordering
                  </div>
                )}
              </div>

              {/* Sold by */}
              <div className="pd-su mt-10 pt-6 border-t border-stone-100 dark:border-stone-800" style={{ animationDelay: ".55s" }}>
                <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                  <span>Sold by</span>
                  <button onClick={() => navigate(`/store/${companySlug}`)} className="font-bold text-stone-600 dark:text-stone-300
                   hover:text-[#c2410c] transition-colors capitalize">{companySlug}</button>
                  <span className="text-stone-200 dark:text-stone-700">·</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-semibold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Accepting Orders
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#faf9f6]/90 dark:bg-stone-950/90 backdrop-blur-2xl border-t border-stone-200/60 dark:border-stone-800 px-4 py-3.5 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[.15em]">Starting from</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">KES</span>
            <span className="text-2xl font-black text-[#1c1917] dark:text-stone-100 tracking-tight tabular-nums">{p.price?.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={handleOrder} className="flex-[1.4] max-w-[220px] flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-orange-600/20 dark:shadow-orange-900/30 active:scale-[.97] transition-all duration-200">
          <ShoppingCart className="w-[18px] h-[18px]" />Order Now
        </button>
      </div>

      {/* Image zoom overlay */}
      {imgZoomed && p.image && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 pd-fi cursor-zoom-out" onClick={() => setImgZoomed(false)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" onClick={() => setImgZoomed(false)}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl pd-img-reveal" />
        </div>
      )}

      {/* Footer */}
      <footer className="hidden md:block border-t border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-stone-600 dark:text-stone-300 capitalize">{companySlug}</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-stone-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c2410c] opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c2410c]" />
            </span>
            Powered by PrintFlow
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;