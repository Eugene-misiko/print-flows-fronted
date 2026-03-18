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
  <div className="max-w-4xl mx-auto px-4 py-8">
    {/* HEADER */}
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        New Print Order
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        Configure your print order details below.
      </p>
    </div>
    {/* FORM CARD */}
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PRODUCT */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Product
            </label>
            {loadingProducts ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <select
                value={formData.product}
                onChange={(e) =>
                  setFormData({ ...formData, product: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {/* QUANTITY */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
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
                })}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"/>
          </div>
        </div>
        {/* PRODUCT PREVIEW */}
        {selectedProduct && (
          <div className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 space-y-3">
            {selectedProduct.image && (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Price per unit</span>
              <span>Ksh {selectedProduct.price}</span>
            </div>
            <div className="flex justify-between items-center border-2 border-orange-500 rounded-lg px-4 py-3">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Total Price
              </span>
              <span className="text-xl font-bold text-orange-500">
                Ksh {total}
              </span>
            </div>
          </div>
        )}
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
            }/>
          <label className="dark:text-gray-300">
            Request Design Service
          </label>
        </div>
        {!formData.needs_design && (
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Upload Design
            </label>
            <input
              type="file"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  design_file: e.target.files[0],
                })
              }
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        )}
        {/* NOTES */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Notes
          </label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="Special instructions..."/>
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition">
          {actionLoading ? "Creating..." : "Submit Order"}
        </button>
      </form>
    </div>
  </div>
);
};

export default ClientOrder;