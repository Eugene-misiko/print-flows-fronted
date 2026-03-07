import { Card, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="cursor-pointer group"
    >
      <Card className="rounded-xl border hover:border-rose-500 hover:shadow-lg transition duration-300">
        <CardContent className="p-4 space-y-4">

          {product.image && (
            <div className="overflow-hidden rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-800">
              {product.name}
            </h3>

            <p className="text-sm text-zinc-500 line-clamp-2">
              {product.description}
            </p>

            <p className="font-semibold text-rose-600">
              From Ksh {product.price}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;