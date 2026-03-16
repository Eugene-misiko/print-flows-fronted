import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/slices/orderSlice";
import api from "@/api";
import { useParams, useNavigate } from "react-router-dom";

const ClientOrder = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createdInvoiceId, actionLoading } = useSelector(
    (state) => state.orders
  );

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
      data.append("design_file", formData.design_file);
    }

    dispatch(createOrder(data));
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Page Header */}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-600">
          Create New Order
        </h2>

        <p className="text-gray-500">
          Fill the form below to place your printing order.
        </p>
      </div>

      {/* Form Card */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Product Select */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Product
            </label>

            <select
              value={formData.product}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  product: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: Number(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Price Display */}

          {selectedProduct && (
            <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-1">
              <p>
                <span className="font-medium">Price per unit:</span>{" "}
                Ksh {selectedProduct.price}
              </p>

              <p className="text-lg font-semibold text-emerald-600">
                Total: Ksh {total}
              </p>
            </div>
          )}

          {/* Design Service */}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.needs_design}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  needs_design: e.target.checked,
                })
              }
              className="w-4 h-4"
            />

            <label className="text-sm">
              Request Design Service
            </label>
          </div>

          {/* Upload Design */}

          {!formData.needs_design && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Your Design
              </label>

              <input
                type="file"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    design_file: e.target.files[0],
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          )}

          {/* Notes */}

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Notes
            </label>

            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Button */}

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {actionLoading ? "Creating..." : "Submit Order"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default ClientOrder;