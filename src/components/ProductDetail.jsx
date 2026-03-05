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
      <div className="ml-56 mt-24 p-8">
        <p className="text-zinc-500 animate-pulse">Loading product...</p>
      </div>
    );

  return (
    <div className="ml-56 mt-24 p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
          <CardContent className="p-8 grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col justify-between space-y-6">

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-rose-600">
                  {product.name}
                </h2>

                <p className="text-zinc-600 dark:text-zinc-400">
                  {product.description}
                </p>
                <p className="text-lg font-semibold text-rose-600">
                  Base Price: Ksh {product.price}
                </p>
              </div>

              {/* Order Button */}
              <Button
                onClick={() => navigate(`/create-order/${product.id}`)}
                className="bg-rose-600 hover:bg-rose-700 text-white w-full cursor-pointer"
              >
                Order This Product
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
                className="cursor-pointer"
              >
                Back to Products
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;