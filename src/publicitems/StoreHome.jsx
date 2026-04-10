import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "@/api/api";
import { Package, Folder, Search, ArrowRight } from "lucide-react";

const StoreHome = () => {
  const { companySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productsAPI.getPublic({ company: companySlug }),
          productsAPI.getPublicCategories({ company: companySlug }),
        ]);
        setProducts(prodRes.data.results || prodRes.data);
        setCategories(catRes.data.results || catRes.data);
      } catch (err) {
        console.error("Store load error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (companySlug) fetchStore();
  }, [companySlug]);

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory ? p.category_id === activeCategory : true;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-700 transition-colors mr-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
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

          {/* SEARCH IN NAV */}
          <div className="hidden sm:block relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200/80 outline-none placeholder:text-slate-400 focus:border-[#06b6d4]/40 focus:ring-2 focus:ring-[#06b6d4]/10 transition"
            />
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH */}
      <div className="sm:hidden px-6 py-3 bg-white border-b border-slate-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200/80 outline-none placeholder:text-slate-400 focus:border-[#06b6d4]/40 focus:ring-2 focus:ring-[#06b6d4]/10 transition"
          />
        </div>
      </div>

      {/* BANNER */}
      <div className="relative overflow-hidden bg-[#0f172a]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#06b6d4]/15 blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#6366f1]/10 blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse"></div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">Open for orders</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Premium Print <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#818cf8]">
                Products & Design
              </span>
            </h1>

            <p className="text-slate-400 mt-5 text-base leading-relaxed max-w-md">
              Browse our curated collection of high-quality print products. Fast turnaround, professional finish.
            </p>
          </div>

          {/* STATS */}
          <div className="flex gap-10 mt-10">
            <div>
              <p className="text-3xl font-extrabold text-white">{products.length}</p>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest font-medium">Products</p>
            </div>
            <div className="w-px bg-slate-700/50"></div>
            <div>
              <p className="text-3xl font-extrabold text-white">{categories.length}</p>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest font-medium">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES + CONTENT */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8 -mt-4 relative z-10">

          {/* CATEGORIES BAR - Frosted Glass */}
          <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 scrollbar-none">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                !activeCategory
                  ? "bg-[#0f172a] text-white shadow-md shadow-slate-900/20"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
              }`}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-5 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-[#0f172a] text-white shadow-md shadow-slate-900/20"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            ))}
          </div>

          <div className="mt-8 mb-6"></div>

          {/* PRODUCTS */}
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center gap-3 text-slate-400">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-sm font-medium">Loading products...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-600 font-medium text-sm">No products found</p>
                  <p className="text-slate-400 text-xs mt-1">Try a different search or category</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-6 font-medium tracking-wide">
                {filtered.length} product{filtered.length !== 1 && "s"} available
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200/80 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden cursor-pointer"
                    onClick={() =>
                      navigate(`/store/${companySlug}/product/${product.id}`)
                    }
                  >
                    <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                      <img
                        src={product.image || "https://via.placeholder.com/400"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        alt={product.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Hover Action Arrow */}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm">
                        <ArrowRight className="w-4 h-4 text-[#0f172a]" />
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-slate-800 text-[13px] leading-snug group-hover:text-[#0891b2] transition-colors line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
                        {product.description}
                      </p>

                      <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-50">
                        <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">
                          KES {product.price}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/store/${companySlug}/product/${product.id}`);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 bg-[#0f172a] text-white rounded-lg hover:bg-[#0891b2] active:scale-95 transition-all duration-200 shadow-sm shadow-slate-900/10"
                        >
                          View
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </>
          )}
        </div>
      </div>

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

export default StoreHome;