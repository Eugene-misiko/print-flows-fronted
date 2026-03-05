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
    <div className="ml-56 p-8 mt-5 min-h-screen bg-rose-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-rose-700">
          General Print Requests
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Browse available printing products by category
        </p>
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`capitalize transition
              ${
                selectedCategory === cat
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-white border border-rose-200 text-rose-600 hover:bg-rose-100"
              }
            `}
          >
            {cat}
          </Button>
        ))}
      </div>

      
      {loading && (
        <p className="text-gray-600 text-center py-10">
          Loading products...
        </p>
      )}

      
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;