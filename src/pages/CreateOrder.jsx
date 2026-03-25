import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/store/slices/ordersSlice";
import { fetchProducts } from "@/store/slices/productsSlice";
import toast from "react-hot-toast";
import { ArrowLeft, ShoppingBag, Calculator, Plus, Trash2 } from "lucide-react";

const CreateOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, categories, isLoading: productsLoading } = useSelector((state) => state.products);
  const { isLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [items, setItems] = useState([{ product: "", quantity: 1, specifications: {}, notes: "" }]);
  const [orderDetails, setOrderDetails] = useState({
    needs_design: false,
    design_description: "",
    description: "",
    priority: "normal",
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1, specifications: {}, notes: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products?.find(p => p.id === parseInt(item.product));
      return total + (product?.price || 0) * (item.quantity || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate items
    const validItems = items.filter(item => item.product && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    // Format items for backend
    const formattedItems = validItems.map(item => ({
      product: parseInt(item.product),
      quantity: parseInt(item.quantity),
      specifications: item.specifications || {},
      notes: item.notes || "",
    }));

    const orderData = {
      items: formattedItems,
      needs_design: orderDetails.needs_design,
      design_description: orderDetails.design_description || "",
      description: orderDetails.description || "",
      priority: orderDetails.priority,
    };

    const result = await dispatch(createOrder(orderData));

    if (createOrder.fulfilled.match(result)) {
      toast.success("Order created successfully!");
      navigate(`/orders/${result.payload.id}`);
    } else {
      toast.error(result.payload || "Failed to create order");
    }
  };

  const total = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-500">Add products and specify requirements</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Items Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              Order Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const product = products?.find(p => p.id === parseInt(item.product));
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Product Select */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product *
                      </label>
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(index, "product", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Select product</option>
                        {products?.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - KES {p.price?.toLocaleString()}
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
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    {/* Subtotal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtotal
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                        KES {((product?.price || 0) * (item.quantity || 0)).toLocaleString()}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                        placeholder="Special instructions for this item"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Design & Details Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-4">
            {/* Needs Design */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={orderDetails.needs_design}
                onChange={(e) => setOrderDetails({ ...orderDetails, needs_design: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <div>
                <span className="font-medium text-gray-900">Requires Design Service</span>
                <p className="text-sm text-gray-500">A designer will create the artwork</p>
              </div>
            </label>

            {orderDetails.needs_design && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design Description
                </label>
                <textarea
                  value={orderDetails.design_description}
                  onChange={(e) => setOrderDetails({ ...orderDetails, design_description: e.target.value })}
                  rows="3"
                  placeholder="Describe what you need designed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Description
              </label>
              <textarea
                value={orderDetails.description}
                onChange={(e) => setOrderDetails({ ...orderDetails, description: e.target.value })}
                rows="2"
                placeholder="Any additional notes about this order..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={orderDetails.priority}
                onChange={(e) => setOrderDetails({ ...orderDetails, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-orange-500" />
            Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">KES {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Deposit (70%)</span>
              <span className="font-bold">KES {Math.round(total * 0.7).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Balance (30%)</span>
              <span>KES {Math.round(total * 0.3).toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            70% deposit required before work begins
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || items.every(i => !i.product)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
