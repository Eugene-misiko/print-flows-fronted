import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPublicProduct } from "@/store/slices/productsSlice";
import { useParams } from "react-router-dom";
import { Package, ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";

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
      navigate(`/login?redirect=/store/${companySlug}/product/${id}`);
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
            <span className="text-sm font-medium">Loading product...</span>
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
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-700 font-semibold">Product not found</p>
            <p className="text-slate-400 text-sm mt-1 mb-6">This product may have been removed or doesn't exist.</p>
            <button
              onClick={() => navigate(`/store/${companySlug}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-[#0f172a] text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm"
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
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">

            {/* IMAGE SECTION */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden p-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={currentProduct.image || "https://via.placeholder.com/600"}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* DETAILS SECTION */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]"></div>
                <span className="text-[11px] text-[#0891b2] font-semibold tracking-wide uppercase">
                  {currentProduct.category || "Available Now"}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                {currentProduct.name}
              </h1>

              <p className="text-slate-500 mt-4 text-[15px] leading-relaxed">
                {currentProduct.description || "No description available for this product."}
              </p>

              {/* PRICE BLOCK */}
              <div className="mt-8 p-6 bg-[#0f172a] rounded-2xl self-start w-full sm:w-auto">
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Starting from</p>
                <p className="text-3xl font-extrabold text-white mt-1">
                  KES {currentProduct.price}
                </p>
              </div>

              {/* EXTRAS / DETAILS LIST */}
              {currentProduct.details && (
                <div className="mt-6 space-y-2.5">
                  {currentProduct.details.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <div className="w-1 h-1 rounded-full bg-[#0891b2] mt-2 shrink-0"></div>
                      <span>{line.replace(/^[-•*]\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA BUTTONS */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleOrder}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 text-sm font-bold px-8 py-4 bg-[#0f172a] text-white rounded-xl hover:bg-[#0891b2] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Select Design Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {!user && (
                <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You will be prompted to log in before ordering
                </p>
              )}

              {/* SOLD BY */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Sold by{" "}
                  <button
                    onClick={() => navigate(`/store/${companySlug}`)}
                    className="font-semibold text-slate-600 hover:text-[#0891b2] transition-colors capitalize"
                  >
                    {companySlug}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white mt-auto">
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