import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createOrder } from "@/slices/orderSlice";
import api from "@/api";

import {Card,CardContent,CardHeader,CardTitle,} from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "./ui/select";
const ClientOrder = () => {
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: "",
    quantity: 1,
    needs_design: false,
    design_file: null,
    notes: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await api.get("/products/");
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("product", formData.product);
    data.append("quantity", formData.quantity);
    data.append("needs_design", formData.needs_design);
    data.append("notes", formData.notes);

    if (formData.design_file) {
      data.append("design_file", formData.design_file);
    }

    dispatch(createOrder(data));
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create New Order
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, product: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: e.target.value, })}/>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.needs_design}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    needs_design: checked,})}/>
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
                      design_file: e.target.files[0],})}/>
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
                    notes: e.target.value,})}/>
            </div>
            <Button type="submit" className="w-full">
              Submit Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOrder;