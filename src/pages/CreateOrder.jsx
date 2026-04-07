import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/store/slices/ordersSlice";
import { fetchProducts } from "@/store/slices/productsSlice";
import toast from "react-hot-toast";
import { ArrowLeft, ShoppingBag, Calculator, Plus, Trash2, ChevronDown, Upload, FileText, X } from "lucide-react";

const CART_KEY = "printing_order_cart";
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const clearCart = () => localStorage.removeItem(CART_KEY);

const FieldInput = ({ field, value, onChange }) => {
  const cls = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm";
  const ph = field.placeholder || field.name;
  if (field.field_type === "select") return (<select value={value || ""} onChange={(e) => onChange(e.target.value)} className={cls}><option value="">Select {field.name}</option>{field.options?.map((o, i) => <option key={i} value={o}>{o}</option>)}
  </select>);
  if (field.field_type === "textarea") return (<textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} rows={2} className={cls} />);
  if (field.field_type === "checkbox") return (<label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={value || false} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
  <span className="text-sm text-gray-600 dark:text-gray-400">{field.help_text || field.name}</span></label>);
  if (field.field_type === "file") return (<input type="file" onChange={(e) => e.target.files[0] && onChange(e.target.files[0].name)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700" />);
  const type = { number: "number", email: "email", phone: "tel", date: "date" }[field.field_type] || "text";
  return <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} className={cls} />;
};

const inputClass = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors";

const CreateOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products } = useSelector((s) => s.products);
  const { isLoading } = useSelector((s) => s.orders);

  const [items, setItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    needs_design: false,
    design_description: "",
    description: "",
    priority: "normal",
    client_files: [], 
  });

  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

  useEffect(() => {
    const cart = getCart();
    if (cart.length > 0) {
      setItems(cart.map((c) => ({
        product: String(c.product),
        quantity: c.quantity,
        specifications: buildSpecs(c),
        notes: c.notes || "",
        _fv: c.fieldValues || {},
        _fd: c.fieldDefinitions || [],
      })));
    }
  }, []);

  const buildSpecs = (c) => {
    const s = {};
    if (c.fieldValues && c.fieldDefinitions) c.fieldDefinitions.forEach((f) => { const v = c.fieldValues[f.id]; if (v !== undefined && v !== "" && v !== false) s[f.name] = v; });
    return s;
  };

  const rebuildSpecs = (fv, fd) => {
    const s = {};
    (fd || []).forEach((f) => { const v = fv?.[f.id]; if (v !== undefined && v !== "" && v !== false) s[f.name] = v; });
    return s;
  };

  const setField = (idx, field, val) => {
    setItems((prev) => {
      const arr = [...prev]; const item = { ...arr[idx] };
      const fv = { ...item._fv, [field]: val }; item._fv = fv;
      item.specifications = rebuildSpecs(fv, item._fd); arr[idx] = item; return arr;
    });
  };

  const updateItem = (idx, field, val) => setItems((prev) => { const a = [...prev]; a[idx] = { ...a[idx], [field]: val }; return a; });
  const addItem = () => setItems((prev) => [...prev, { product: "", quantity: 1, specifications: {}, notes: "", _fv: {}, _fd: [] }]);
  const removeItem = (idx) => setItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  const getProduct = (item) => products?.find((p) => p.id === parseInt(item.product));
  const total = items.reduce((s, i) => s + (getProduct(i)?.price || 0) * (i.quantity || 0), 0);

  // Handle client file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((f) => ({ name: f.name, type: f.type, size: f.size }));
    setOrderDetails((prev) => ({
      ...prev,
      client_files: [...prev.client_files, ...newFiles],
    }));
    e.target.value = ""; // Reset input
  };

  const removeClientFile = (idx) => {
    setOrderDetails((prev) => ({
      ...prev,
      client_files: prev.client_files.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = items.filter((i) => i.product && i.quantity > 0);
    if (!valid.length) return toast.error("Add at least one product");

    // Validate required fields
    for (const item of valid) {
      const p = getProduct(item);
      const missing = (p?.fields || []).filter((f) => f.required && !item._fv?.[f.id] && item._fv?.[f.id] !== false);
      if (missing.length) return toast.error(`${p.name}: Missing ${missing.map((f) => f.name).join(", ")}`);
    }

    // If needs design, description is required
    if (orderDetails.needs_design && !orderDetails.design_description.trim()) {
      return toast.error("Please describe the design you need");
    }

    const data = {
      items: valid.map((i) => ({ product: parseInt(i.product), quantity: parseInt(i.quantity), specifications: i.specifications || {}, notes: i.notes || "" })),
      needs_design: orderDetails.needs_design,
      design_description: orderDetails.design_description || "",
      description: orderDetails.description || "",
      priority: orderDetails.priority,
      client_files: orderDetails.client_files.length > 0 ? orderDetails.client_files : [],
    };

    const r = await dispatch(createOrder(data));
    if (createOrder.fulfilled.match(r)) { toast.success("Order created! An invoice has been generated."); clearCart(); navigate(`/orders/${r.payload.id}`); }
    else toast.error(r.payload || "Failed to create order");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Order</h1>
          <p className="text-gray-500 dark:text-gray-400">Add products, upload your design or request one</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-orange-500" /> Order Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 font-medium"><Plus className="w-4 h-4" /> Add Item</button>
          </div>
          <div className="space-y-4">
            {items.map((item, idx) => {
              const product = getProduct(item);
              const min = product?.min_quantity || 1, max = product?.max_quantity || 10000;
              return (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product *</label>
                      <select value={item.product} onChange={(e) => {
                        const np = products?.find((p) => p.id === parseInt(e.target.value));
                        const fv = {}; (np?.fields || []).forEach((f) => { fv[f.id] = f.field_type === "checkbox" ? false : ""; });
                        setItems((prev) => { const a = [...prev]; a[idx] = { product: e.target.value, quantity: np?.min_quantity || 1, specifications: {}, notes: "", _fv: fv, _fd: np?.fields || [] }; return a; });
                      }} className={inputClass} required>
                        <option value="">Select product</option>
                        {products?.map((p) => <option key={p.id} value={p.id}>{p.name} - KES {p.price?.toLocaleString()}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity * {product && <span className="text-xs text-gray-400">({min}-{max})</span>}</label>
                      <input type="number" min={min} max={max} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Math.max(min, Math.min(max, parseInt(e.target.value) || min)))} className={inputClass} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtotal</label>
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white font-medium">KES {((product?.price || 0) * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                  {product?.fields?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button type="button" onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle("hidden")} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"><ChevronDown className="w-4 h-4" /> Specifications ({product.fields.length})</button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.fields.map((f) => (
                          <div key={f.id}>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{f.name}{f.required && <span className="text-red-500 ml-1">*</span>}</label>
                            <FieldInput field={f} value={item._fv?.[f.id]} onChange={(v) => setField(idx, f.id, v)} />
                            {f.help_text && f.field_type !== "checkbox" && <p className="text-xs text-gray-400 mt-1">{f.help_text}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label><input type="text" value={item.notes} onChange={(e) => updateItem(idx, "notes", e.target.value)} placeholder="Special instructions..." className={inputClass} /></div>
                  {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Remove</button>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Design Section — THE KEY PART */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Design Files</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Do you have your own design, or do you need us to create one?</p>

          {/* Option 1: Upload own design */}
          <div className={`p-4 rounded-lg border-2 transition-colors mb-4 ${!orderDetails.needs_design ? "border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10" : "border-gray-200 dark:border-gray-700"}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" checked={!orderDetails.needs_design} onChange={(e) => setOrderDetails((p) => ({ ...p, needs_design: false }))} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">I have my own design</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload your print-ready files</p>
              </div>
            </label>

            {!orderDetails.needs_design && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Design Files</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG, AI, PSD accepted</p>
                    <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.ai,.psd" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ position: "relative", marginTop: "-60px", height: "60px" }} />
                  </div>
                </div>
                {orderDetails.client_files.length > 0 && (
                  <div className="space-y-2">
                    {orderDetails.client_files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-orange-500" /><span className="text-sm">{f.name}</span><span className="text-xs text-gray-400">({(f.size / 1024).toFixed(1)}KB)</span></div>
                        <button type="button" onClick={() => removeClientFile(i)} className="text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Option 2: Request design */}
          <div className={`p-4 rounded-lg border-2 transition-colors ${orderDetails.needs_design ? "border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10" : "border-gray-200 dark:border-gray-700"}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" checked={orderDetails.needs_design} onChange={(e) => setOrderDetails((p) => ({ ...p, needs_design: true }))} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">I need a design created</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Our designer will create artwork for you</p>
              </div>
            </label>

            {orderDetails.needs_design && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Describe what you need designed *</label>
                <textarea value={orderDetails.design_description} onChange={(e) => setOrderDetails((p) => ({ ...p, design_description: e.target.value }))} rows={4} placeholder="E.g., Business card with company logo, blue and white theme, include phone number and email address..." className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Be as detailed as possible so the designer understands your requirements</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Notes</label><textarea value={orderDetails.description} onChange={(e) => setOrderDetails((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Any additional notes about this order..." className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label><select value={orderDetails.priority} onChange={(e) => setOrderDetails((p) => ({ ...p, priority: e.target.value }))} className={inputClass}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Calculator className="w-5 h-5 text-orange-500" /> Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Subtotal ({items.filter((i) => i.product).length} items)</span><span className="font-medium text-gray-900 dark:text-white">KES {total.toLocaleString()}</span></div>
            <div className="flex justify-between text-orange-600 dark:text-orange-400"><span>Deposit (70%)</span><span className="font-bold">KES {Math.round(total * 0.7).toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500 text-sm"><span>Balance (30%)</span><span>KES {Math.round(total * 0.3).toLocaleString()}</span></div>
          </div>
          <p className="text-xs text-gray-500 mt-4">70% deposit must be paid before work begins. Invoice will be generated automatically.</p>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate("/orders")} className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" disabled={isLoading || items.every((i) => !i.product)} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 disabled:opacity-50 shadow-sm">{isLoading ? "Creating..." : "Create Order"}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;