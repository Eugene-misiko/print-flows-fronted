import { Card, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

  return (
    <div onClick={()=>navigate(`/products/${product.id} `)} className="cursor-pointer">
    <Card className="hover:shadow-md transition rounded-xl">
      <CardContent className="p-4 space-y-3">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 object-cover rounded-md"
          />
        )}

        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            {product.description}
          </p>
          <p className="font-medium">Base Price: Ksh {product.price}</p>
          
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default ProductCard;