import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="cursor-pointer group"
    >
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">

        {product.image && (
          <div className="overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        )}

        <div className="p-4 space-y-2">

          <h3 className="text-lg font-semibold text-gray-800">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>

          <p className="font-semibold text-emerald-600">
            From Ksh {product.price}
          </p>

        </div>

      </div>
    </div>
  );
};

export default ProductCard;