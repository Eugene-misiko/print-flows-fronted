import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/slices/productSlice";
import ProductCard from "./ProductCard";
import { Button } from "./ui/button";

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
    <div className="ml-56 mt-24 p-8 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-rose-600">
          Printing Services
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 max-w-xl">
          Browse our available printing services and submit your request easily.
          Choose from banners, business cards, branded clothing, flyers and more.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`cursor-pointer capitalize transition
            ${
              selectedCategory === cat
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900"
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>
      {loading && (
        <p className="text-zinc-500 animate-pulse">
          Loading products...
        </p>
      )}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          No products found in this category.
        </div>
      )}
    </div>
  );
};

export default Products;