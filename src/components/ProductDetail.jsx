import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await api.get(`/api/products/${id}/`);
      setProduct(response.data);
    };

    fetchProduct();
  }, [id]);

  if (!product)
    return (
      <p className="text-center text-gray-500 mt-20">
        Loading product...
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Page Title */}

      <div>
        <h2 className="text-3xl font-bold text-emerald-600">
          Product Details
        </h2>
        <p className="text-gray-500">
          View product information before placing your order.
        </p>
      </div>

      {/* Product Card */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Image */}

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover"
        />

        {/* Content */}

        <div className="p-8 space-y-4">

          <h3 className="text-2xl font-bold text-gray-800">
            {product.name}
          </h3>

          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <p className="text-xl font-semibold text-emerald-600">
            Base Price: Ksh {product.price}
          </p>

          {/* Button */}

          <button
            onClick={() => navigate(`/create-order/${product.id}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-lg font-medium transition"
          >
            Order This Product
          </button>

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;