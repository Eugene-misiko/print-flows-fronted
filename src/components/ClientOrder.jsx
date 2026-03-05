import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createOrder } from "@/slices/orderSlice";
import api from "@/api";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {Select, SelectContent,SelectItem,SelectTrigger,SelectValue,
} from "./ui/select";
const ClientOrder = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    product: productId || "",
    quantity: 1,
    needs_design: false,
    design_file: null,
    notes: "",
  });

  useEffect(() => {
    if (productId) {
      setFormData((prev) => ({ ...prev, product: productId }));
    }
  }, [productId]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await api.get("api/products/");
      setProducts(response.data);
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    const product = products.find(
      (p) => String(p.id) === String(formData.product)
    );
    setSelectedProduct(product);
  }, [formData.product, products]);
  const total =
    selectedProduct?.price && formData.quantity
      ? selectedProduct.price * formData.quantity
      : 0;
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("product", formData.product);
    data.append("quantity", formData.quantity);
    data.append("needs_design", formData.needs_design ? "true" : "false");
    data.append("description", formData.notes);

    if (formData.design_file) {
      data.append("design_file", formData.design_file);
    }

    dispatch(createOrder(data));
  };

  return (
    <div className="ml-56 mt-24 p-8">

      <div className="max-w-2xl mx-auto">

        <Card className="rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">

          <CardHeader>
            <CardTitle className="text-2xl font-bold text-rose-600">
              Create New Order
            </CardTitle>
          </CardHeader>

          <CardContent>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Product
                </label>

                <Select
                  value={formData.product}
                  onValueChange={(value) =>
                    setFormData({ ...formData, product: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>

                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={String(product.id)}
                      >
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Quantity
                </label>

                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>
              {selectedProduct && (
                <div className="bg-rose-50 dark:bg-zinc-900 border border-rose-200 dark:border-zinc-700 p-4 rounded-lg space-y-1">

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Price per unit
                  </p>

                  <p className="font-medium">
                    Ksh {selectedProduct.price}
                  </p>

                  <p className="text-lg font-semibold text-rose-600">
                    Total: Ksh {total}
                  </p>

                </div>
              )}
              <div className="flex items-center space-x-3">

                <Checkbox
                  checked={formData.needs_design}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      needs_design: checked,
                    })
                  }
                />

                <label className="text-sm font-medium">
                  Request Design Service
                </label>

              </div>
              {!formData.needs_design && (
                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Upload Your Design
                  </label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design_file: e.target.files[0],
                      })
                    }
                  />
                </div>
              )}
              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Additional Notes
                </label>

                <Textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value,
                    })
                  }
                />

              </div>
              <Button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Submit Order
              </Button>

            </form>

          </CardContent>

        </Card>

      </div>

    </div>
  );
};

export default ClientOrder;