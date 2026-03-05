import { Card, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="cursor-pointer group"
    >
      <Card className="rounded-xl border border-zinc-200 dark:border-zinc-800 
      hover:border-rose-400 hover:shadow-lg transition duration-300">
        <CardContent className="p-4 space-y-3">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md group-hover:scale-105 transition"
            />
          )}

          <div className="space-y-1">

            <h3 className="text-lg font-semibold group-hover:text-rose-600 transition">
              {product.name}
            </h3>

            <p className="text-sm text-zinc-500 line-clamp-2">
              {product.description}
            </p>

            <p className="font-medium text-rose-600">
              Base Price: Ksh {product.price}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;