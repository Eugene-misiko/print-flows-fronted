import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/slices/orderSlice";
import api from "@/api";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "./ui/select";

const ClientOrder = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createdInvoiceId, actionLoading } = useSelector((state) => state.orders);
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

  //  redirect to invoice after order creation
  useEffect(() => {
    if (createdInvoiceId) {
      navigate(`/invoice/${createdInvoiceId}`);
    }
  }, [createdInvoiceId, navigate]);

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
      data.append("design_file", formData.design_file);}
    dispatch(createOrder(data));
  };
  return (
    <div className="ml-56 mt-24 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label>Product</label>
                <Select
                  value={formData.product}
                  onValueChange={(value) =>
                    setFormData({ ...formData, product: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
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
              <div>
                <label>Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })}/>
              </div>
              {selectedProduct && (
                <div>
                  <p>Price per unit</p>
                  <p>Ksh {selectedProduct.price}</p>
                  <p>Total: Ksh {total}</p>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.needs_design}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      needs_design: checked,}) } />
                <label>Request Design Service</label>
              </div>
              {!formData.needs_design && (
                <div>
                  <label>Upload Your Design</label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        design_file: e.target.files[0],})}/>
                </div>
              )}
              <div>
                <label>Additional Notes</label>
                <Textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value,})}/>
              </div>
              <Button
                type="submit"
                disabled={actionLoading} >
                {actionLoading ? "Creating..." : "Submit Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOrder;