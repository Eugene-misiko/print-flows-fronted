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
      const response = await api.get(`/api/products/${id}/`);
      setProduct(response.data);
    };

    fetchProduct();
  }, [id]);

  if (!product)
    return (
      <p className="p-6 text-center text-zinc-500">
        Loading product...
      </p>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <Card className="rounded-2xl shadow-lg mt-10 ">
        <CardContent className="p-6 space-y-6">

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-[6%]"
          />

          <div className="space-y-3">

            <h2 className="text-3xl font-bold text-zinc-800">
              {product.name}
            </h2>

            <p className="text-zinc-600 leading-relaxed">
              {product.description}
            </p>

            <p className="text-xl font-semibold text-rose-600">
              Base Price: Ksh {product.price}
            </p>

          </div>

          <Button
            onClick={() => navigate(`/create-order/${product.id}`)}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-6 text-lg rounded-xl"
          >
            Order This Product
          </Button>

        </CardContent>
      </Card>

    </div>
  );
};

export default ProductDetail;