import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import ProductCard from "@/components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("api/products/");
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category_name || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});
  console.log(groupedProducts);
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Products
          </h1>
          <p className="text-gray-500">
            Manage your product catalog
          </p>
        </div>
        {/* Add Product Button */}
        <button
          onClick={() => navigate("/products/new")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium transition">
          + Add Product
        </button>
      </div>
      {/* Loading */}
      {loading && (
        <p className="text-gray-500">Loading products...</p>
      )}
      {/* Product Categories */}
      {!loading &&
        Object.entries(groupedProducts).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product} 
                />
              ))}
            </div>
          </div>))}
    </div>
  );
};

export default Products;