import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "@/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth); 

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/products/${id}/`);
        setProduct(response.data);
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/api/products/${id}/`);
      navigate("/products");
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-500 animate-pulse">
          Loading product...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Product Details
          </h2>
          <p className="text-gray-500">
            View product information before placing your order.
          </p>
        </div>

        {/* ADMIN ACTIONS */}

        {user?.role === "admin" && (
          <div className="flex gap-3">

            <button
              onClick={() => navigate(`/products/edit/${product.id}`)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Delete
            </button>

          </div>
        )}

      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-100 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>
        <div className="p-8 space-y-4">

          <h3 className="text-2xl font-bold text-gray-800">
            {product.name}
          </h3>
          {product.category && (
            <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">
              {product.category_name}
            </span>
          )}

          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <p className="text-xl font-semibold text-emerald-600">
            Base Price: Ksh {product.price}
          </p>

          {user?.role !== "admin" && (
            <button
              onClick={() => navigate(`/create-order/${product.id}`)}
              className="
                w-full
                bg-emerald-600
                hover:bg-emerald-700
                text-white
                py-3
                rounded-lg
                text-lg
                font-medium
                transition
              "
            >
              Order This Product
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;