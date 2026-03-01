import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/slices/productsSlice";
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Our Products</h1>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.toUpperCase()}
          </Button>
        ))}
      </div>

      {loading && <p>Loading products...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;