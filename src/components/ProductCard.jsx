import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-md transition">

      <div className="flex items-start justify-between mb-3">

        <h3 className="text-lg font-semibold text-gray-800">
          {product.name}
        </h3>

        {product.category && (
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 whitespace-nowrap">
            {product.category_name}
          </span>
        )}

      </div>
      {product.description && (
        <p className="text-gray-500 text-sm mb-5">
          {product.description}
        </p>
      )}
      <div className="text-2xl font-bold text-gray-900">
        Ksh {product.price}
        <span className="text-sm font-normal text-gray-400 ml-1">
          / unit
        </span>
      </div>

    </div>
  );
};

export default ProductCard;