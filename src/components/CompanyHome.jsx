import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import {getCompanyBySlug} from "@/store/slices/companySlice";
import {fetchPublicProducts, fetchPublicCategories} from "@/store/slices/productsSlice";

const CompanyHome = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { company, products, categories, isLoading } = useSelector(
    (state) => state.company
  );

  useEffect(() => {
    if (!slug) return;

    dispatch(getCompanyBySlug(slug));
    dispatch(fetchPublicProducts({ company: slug }));
    dispatch(fetchPublicCategories({ company: slug }));
  }, [slug, dispatch]);

  const handleNav = (path) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950">

      {/* ─── HERO ─── */}
      <section className="pt-24 pb-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {company?.name || "Company"}
        </h1>

        <p className="text-stone-500 mb-6 max-w-xl mx-auto">
          {company?.description || "Welcome to our store"}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleNav(`/company/${slug}/register`)}
            className="px-6 py-3 bg-[#c2410c] text-white rounded-lg flex items-center gap-2"
          >
            Join Store <ArrowRight size={16} />
          </button>

          <button
            onClick={() => handleNav(`/company/${slug}/login`)}
            className="px-6 py-3 border rounded-lg"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Categories</h2>

          <div className="flex flex-wrap gap-3">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  handleNav(`/company/${slug}/category/${cat.slug}`)
                }
                className="px-4 py-2 border rounded-lg text-sm"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS ─── */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Products</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products?.slice(0, 6).map((product) => (
              <div
                key={product.id}
                onClick={() =>
                  handleNav(`/company/${slug}/product/${product.slug}`)
                }
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
              >
                <div className="h-40 bg-stone-100 mb-3 rounded" />

                <h3 className="font-semibold text-sm">
                  {product.name}
                </h3>

                <p className="text-xs text-stone-500">
                  {product.short_description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => handleNav(`/company/${slug}/product`)}
              className="px-6 py-3 border rounded-lg"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CompanyHome;