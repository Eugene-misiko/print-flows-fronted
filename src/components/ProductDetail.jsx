import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await api.get(`/products/${id}/`);
      setProduct(response.data);
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover rounded-lg"/>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
            <p className="font-medium">Base Price: ${product.base_price}</p>
          </div>

          <Button
            onClick={() => navigate(`/create-order/${product.id}`)}
            className="w-full"
          >
            Order Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetail;