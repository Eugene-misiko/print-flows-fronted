import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/slices/orderSlice";
import api from "@/api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ClientOrder = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { createdInvoiceId, actionLoading, error } = useSelector(
    (state) => state.orders
  );
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    product: productId || "",
    quantity: 1,
    needs_design: false,
    design_file: null,
    notes: "",
  });
  // SET PRODUCT FROM URL
  useEffect(() => {
    if (productId) {
      setFormData((prev) => ({ ...prev, product: productId }));
    }
  }, [productId]);

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("api/products/");
        setProducts(response.data);
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // SELECTED PRODUCT
  useEffect(() => {
    const product = products.find(
      (p) => String(p.id) === String(formData.product)
    );
    setSelectedProduct(product);
  }, [formData.product, products]);

  // REDIRECT AFTER SUCCESS
  useEffect(() => {
    if (createdInvoiceId) {
      toast.success("Order created successfully!");
      navigate(`/invoice/${createdInvoiceId}`);
    }
  }, [createdInvoiceId, navigate]);

  // HANDLE SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    if (actionLoading) return;

    // VALIDATION
    if (!formData.product) {
      toast.error("Please select a product");
      return;
    }

    if (formData.quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    const data = new FormData();
    data.append("product", formData.product);
    data.append("quantity", formData.quantity);
    data.append("needs_design", formData.needs_design);
    data.append("description", formData.notes);

    if (formData.design_file) {
      data.append("design_file", formData.design_file);
    }

    dispatch(createOrder(data));
  };

  const total =
    selectedProduct?.price && formData.quantity
      ? selectedProduct.price * formData.quantity
      : 0;

  return (
    <div className="max-w-2xl mx-auto ">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-600">
          Create New Order
        </h2>
        <p className="text-gray-500">
          Fill the form below to place your printing order.
        </p>
      </div>
      {/* FORM */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PRODUCT */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product
            </label>
            {loadingProducts ? (
              <p className="text-gray-500">Loading products...</p>
            ) : (
              <select
                value={formData.product}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    product: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {/* PRODUCT PREVIEW */}
          {selectedProduct ? (
            <div className="space-y-3">
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-40 object-cover rounded-lg border"
                />
              )}
              <div className="bg-gray-50 border rounded-lg p-4 text-sm space-y-1">
                <p>
                  <span className="font-medium">Price per unit:</span>{" "}
                  Ksh {selectedProduct.price}
                </p>
                <p className="text-lg font-semibold text-emerald-600">
                  Total: Ksh {total}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Select a product to see details
            </p>
          )}
          {/* QUANTITY */}
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
          {/* DESIGN OPTION */}
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
          {/* FILE UPLOAD */}
          {!formData.needs_design && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Your Design File (optional)
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
          {/* NOTES */}
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
          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          {/* SUBMIT */}
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