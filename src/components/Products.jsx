import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/slices/productSlice";
import ProductCard from "./ProductCard";

const categories = [
  "all",
  "banner",
  "clothes",
  "books",
  "cards",
  "cups",
  "pens",
  "flyers",
  "others",
];

const Products = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);

  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts =
    selectedCategory === "all"
      ? items
      : items.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Products
        </h1>
        <p className="text-gray-500">
          Browse our printing services and create an order.
        </p>
      </div>

      {/* Category Filters */}

      <div className="flex flex-wrap gap-3">

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition
            ${
              selectedCategory === cat
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}

      </div>

      {/* Loading State */}

      {loading && (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500 animate-pulse">
            Loading products...
          </p>
        </div>
      )}

      {/* Products Grid */}

      {!loading && (
        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-6
        "
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

      {/* Empty State */}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No products found in this category.
        </div>
      )}

    </div>
  );
};

export default Products;