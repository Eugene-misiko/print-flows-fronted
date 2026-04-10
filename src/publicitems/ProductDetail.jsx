import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPublicProduct } from "@/store/slices/productsSlice";
import { useParams } from "react-router-dom";
import { Package, ArrowRight, ArrowLeft, ShoppingCart, Clock, Layers, CheckCircle } from "lucide-react";

const ProductDetail = () => {
  const { id, companySlug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id && companySlug) {
      dispatch(fetchPublicProduct({ id, companySlug }));
    }
    window.scrollTo(0, 0);
  }, [dispatch, id, companySlug]);

  const handleOrder = () => {
    if (!user) {
      navigate(`/store/${companySlug}/login/${id}`);
    } else {
      navigate("/app/orders/new", {
        state: {
          product: currentProduct,
          companySlug,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#6366f1] flex items-center justify-center shadow-sm shadow-[#06b6d4]/20">
                <span className="text-white text-xs font-extrabold">{companySlug?.charAt(0)?.toUpperCase()}</span>
              </div>
              <span className="font-bold text-slate-900 text-lg capitalize">{companySlug}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-sm font-medium">Loading product details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#6366f1] flex items-center justify-center shadow-sm shadow-[#06b6d4]/20">
                <span className="text-white text-xs font-extrabold">{companySlug?.charAt(0)?.toUpperCase()}</span>
              </div>
              <span className="font-bold text-slate-900 text-lg capitalize">{companySlug}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-800 font-bold text-xl">Product not found</p>
            <p className="text-slate-400 text-sm mt-2 mb-8 max-w-sm mx-auto">The product you're looking for might have been removed or is temporarily unavailable.</p>
            <button
              onClick={() => navigate(`/store/${companySlug}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 bg-[#0f172a] text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(`/store/${companySlug}`)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Store</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#6366f1] flex items-center justify-center shadow-sm shadow-[#06b6d4]/20">
              <span className="text-white text-xs font-extrabold">
                {companySlug?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span className="font-bold text-slate-900 text-lg capitalize">
              {companySlug}
            </span>
          </div>

          <div className="w-24"></div> 
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 pb-28 md:pb-0"> {/* pb-28 for mobile sticky CTA spacing */}
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">

            {/* IMAGE SECTION */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 group">
              <div className="relative aspect-[4/5] md:aspect-square overflow-hidden bg-slate-100">
                <img
                  src={currentProduct.image || "https://via.placeholder.com/600"}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Subtle overlay at bottom for depth */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>
            </div>

            {/* DETAILS SECTION */}
            <div className="flex flex-col justify-center">
              
              {/* Category Badge */}
              <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]"></div>
                <span className="text-[11px] text-[#0891b2] font-bold tracking-wide uppercase">
                  {currentProduct.category || "Available Now"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                {currentProduct.name}
              </h1>

              {/* Quick Info Row */}
              <div className="flex items-center gap-5 mt-5 text-xs font-medium text-slate-500">
                {currentProduct.production_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#06b6d4]" />
                    <span>{currentProduct.production_time}h Turnaround</span>
                  </div>
                )}
                {currentProduct.min_quantity && (
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#6366f1]" />
                    <span>Min. Order: {currentProduct.min_quantity} pcs</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-slate-500 mt-6 text-[15px] leading-relaxed">
                {currentProduct.description || "No description available for this product."}
              </p>

              {/* PRICE BLOCK */}
              <div className="mt-8 p-6 bg-[#0f172a] rounded-2xl self-start w-full sm:w-auto relative overflow-hidden">
                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#06b6d4]/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative">
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Starting from</p>
                  <p className="text-4xl font-extrabold text-white mt-2 tracking-tight">
                    KES {currentProduct.price?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* EXTRAS / DETAILS LIST */}
              {currentProduct.details && (
                <div className="mt-8 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Features & Details</h3>
                  <div className="space-y-2.5">
                    {currentProduct.details.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-[#0891b2] mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{line.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              
              <div className="hidden md:flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-10">
                <button
                  onClick={handleOrder}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 text-sm font-bold px-10 py-4 bg-[#0f172a] text-white rounded-xl hover:bg-[#0891b2] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Select Design Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {!user && (
                <p className="hidden md:flex mt-4 text-xs text-slate-400 items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You will be prompted to log in before ordering
                </p>
              )}

              {/* SOLD BY */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  Sold by{" "}
                  <button
                    onClick={() => navigate(`/store/${companySlug}`)}
                    className="font-bold text-slate-600 hover:text-[#0891b2] transition-colors capitalize"
                  >
                    {companySlug}
                  </button>
                  <span className="mx-1">·</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    Accepting Orders
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-4 shadow-2xl shadow-slate-900/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">KES {currentProduct.price?.toLocaleString()}</span>
        </div>
        <button 
          onClick={handleOrder}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          Order Now
        </button>
      </div>

      {/* FOOTER */}
      <footer className="hidden md:block border-t border-slate-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-500 capitalize">{companySlug}</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse"></div>
            Storefront powered by PrintHub
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;