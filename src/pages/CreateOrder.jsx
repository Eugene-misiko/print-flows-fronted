import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  Truck,
  FileText,
  Palette,
  CreditCard,
} from "lucide-react";
import { fetchProducts, fetchCategories } from "../store/slices/productsSlice";
import { createOrder } from "../store/slices/ordersSlice";
import { toast } from "react-toastify";

const CreateOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, isLoading: productsLoading } = useSelector((state) => state.products);
  const { isLoading } = useSelector((state) => state.orders);

  const [items, setItems] = useState([
    { product_id: "", quantity: 1, field_values: {} },
  ]);
  const [needsDesign, setNeedsDesign] = useState(false);
  const [designNotes, setDesignNotes] = useState("");
  const [transportation, setTransportation] = useState({
    mode: "PICKUP",
    address: "",
  });
  const [depositPercentage] = useState(70);

  useEffect(() => {
    dispatch(fetchProducts({ page_size: 100 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, field_values: {} }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const updateFieldValue = (itemIndex, fieldName, value) => {
    const newItems = [...items];
    newItems[itemIndex].field_values[fieldName] = value;
    setItems(newItems);
  };

  const getSelectedProduct = (productId) => {
    return products.find((p) => p.id === productId);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = getSelectedProduct(item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateDeposit = () => {
    return (calculateTotal() * depositPercentage) / 100;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validItems = items.filter((item) => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (transportation.mode === "DELIVERY" && !transportation.address.trim()) {
      toast.error("Please enter delivery address");
      return;
    }

    // Prepare data
    const orderData = {
      items: validItems.map((item) => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity),
        field_values: Object.entries(item.field_values).map(([field_name, value]) => ({
          field_name,
          value,
        })),
      })),
      needs_design: needsDesign,
      design_notes: needsDesign ? designNotes : "",
      transportation: transportation.mode === "DELIVERY" ? transportation : null,
    };

    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      toast.success("Order created successfully!");
      navigate(`/orders/${result.id}`);
    } catch (error) {
      toast.error(error || "Failed to create order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-500 mt-1">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-6">
                {items.map((item, index) => {
                  const selectedProduct = getSelectedProduct(item.product_id);
                  return (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg relative"
                    >
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product Select */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product *
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItem(index, "product_id", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          >
                            <option value="">Select a product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Dynamic Fields */}
                      {selectedProduct?.fields?.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-medium text-gray-700">Product Options</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedProduct.fields.map((field) => (
                              <div key={field.id}>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {field.name} {field.required && "*"}
                                </label>
                                {field.field_type === "TEXT" && (
                                  <input
                                    type="text"
                                    value={item.field_values[field.name] || ""}
                                    onChange={(e) =>
                                      updateFieldValue(index, field.name, e.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required={field.required}
                                  />
                                )}
                                {field.field_type === "NUMBER" && (
                                  <input
                                    type="number"
                                    value={item.field_values[field.name] || ""}
                                    onChange={(e) =>
                                      updateFieldValue(index, field.name, e.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required={field.required}
                                  />
                                )}
                                {field.field_type === "SELECT" && (
                                  <select
                                    value={item.field_values[field.name] || ""}
                                    onChange={(e) =>
                                      updateFieldValue(index, field.name, e.target.value)
                                    }
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required={field.required}
                                  >
                                    <option value="">Select...</option>
                                    {field.options?.map((opt, i) => (
                                      <option key={i} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {field.field_type === "TEXTAREA" && (
                                  <textarea
                                    value={item.field_values[field.name] || ""}
                                    onChange={(e) =>
                                      updateFieldValue(index, field.name, e.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    rows={2}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required={field.required}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Item Total */}
                      {selectedProduct && (
                        <div className="mt-4 text-right">
                          <span className="text-sm text-gray-600">Item Total: </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedProduct.price * item.quantity)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Design */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Design Service</h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={needsDesign}
                    onChange={(e) => setNeedsDesign(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700">
                    I need a designer to create my artwork
                  </span>
                </label>

                {needsDesign && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Design Notes
                    </label>
                    <textarea
                      value={designNotes}
                      onChange={(e) => setDesignNotes(e.target.value)}
                      placeholder="Describe what you need designed..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Transportation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-5 w-5 text-cyan-600" />
                <h2 className="text-lg font-semibold text-gray-900">Delivery Method</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="transportation"
                      value="PICKUP"
                      checked={transportation.mode === "PICKUP"}
                      onChange={() => setTransportation({ ...transportation, mode: "PICKUP" })}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Pickup</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="transportation"
                      value="DELIVERY"
                      checked={transportation.mode === "DELIVERY"}
                      onChange={() => setTransportation({ ...transportation, mode: "DELIVERY" })}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Delivery</span>
                  </label>
                </div>

                {transportation.mode === "DELIVERY" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      value={transportation.address}
                      onChange={(e) =>
                        setTransportation({ ...transportation, address: e.target.value })
                      }
                      placeholder="Enter your full delivery address..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                </div>

                {transportation.mode === "DELIVERY" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">TBD</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm font-medium">Deposit Required</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    {formatCurrency(calculateDeposit())}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {depositPercentage}% deposit to confirm order
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Order..." : "Create Order"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to payment after order creation
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
