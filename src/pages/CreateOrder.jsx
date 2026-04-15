import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/store/slices/ordersSlice";
import { fetchProducts } from "@/store/slices/productsSlice";
import toast from "react-hot-toast";
import { ArrowLeft, ShoppingBag, Calculator, Plus, Trash2, ChevronDown, Upload, FileText, X, Check } from "lucide-react";

const CART_KEY = "printing_order_cart";
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const clearCart = () => localStorage.removeItem(CART_KEY);
const fmtCurrency = (a) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(a || 0);
const FieldInput = ({ field, value, onChange }) => {
  const cls = "w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none text-sm transition-all";
  const ph = field.placeholder || field.name;
  
  if (field.field_type === "select") return (<select value={value || ""} onChange={(e) => onChange(e.target.value)} className={cls}><option value="">Select {field.name}</option>{field.options?.map((o, i) => <option key={i} value={o}>{o}</option>)}</select>);
  if (field.field_type === "textarea") return (<textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} rows={2} className={cls} />);
  
  if (field.field_type === "checkbox") return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" checked={value || false} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-5 h-5 bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md peer-checked:bg-[#c2410c] peer-checked:border-[#c2410c] transition-colors" />
        <svg className="w-3 h-3 text-white absolute top-[3px] left-[3px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <span className="text-sm text-stone-600 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">{field.help_text || field.name}</span>
    </label>
  );
  
  if (field.field_type === "file") return (
    <input type="file" onChange={(e) => e.target.files[0] && onChange(e.target.files[0].name)}
      className="w-full text-sm text-stone-500 dark:text-stone-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#fff7ed] dark:file:bg-[#c2410c]/15 file:text-[#c2410c] dark:file:text-[#ea580c] hover:file:bg-orange-100 dark:hover:file:bg-[#c2410c]/25 cursor-pointer" />
  );
  
  const type = { number: "number", email: "email", phone: "tel", date: "date" }[field.field_type] || "text";
  return <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} className={cls} />;
};

const inputClass = "w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none transition-all text-sm";

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((f) => ({ name: f.name, type: f.type, size: f.size }));
    setOrderDetails((prev) => ({ ...prev, client_files: [...prev.client_files, ...newFiles] }));
    e.target.value = ""; 
  };

  const removeClientFile = (idx) => {
    setOrderDetails((prev) => ({ ...prev, client_files: prev.client_files.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = items.filter((i) => i.product && i.quantity > 0);
    if (!valid.length) return toast.error("Add at least one product");

    for (const item of valid) {
      const p = getProduct(item);
      const missing = (p?.fields || []).filter((f) => f.required && !item._fv?.[f.id] && item._fv?.[f.id] !== false);
      if (missing.length) return toast.error(`${p.name}: Missing ${missing.map((f) => f.name).join(", ")}`);
    }

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
    if (createOrder.fulfilled.match(r)) { toast.success("Order created! An invoice has been generated."); clearCart(); navigate(`/app/orders/${r.payload.id}`); }
    else toast.error(r.payload || "Failed to create order");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/orders" className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors active:scale-95"><ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-300" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Create New Order</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Add products, upload your design or request one</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Items */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-[#c2410c]" /></div> Order Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-sm text-[#c2410c] dark:text-[#ea580c] font-bold hover:underline"><Plus className="w-4 h-4" /> Add Item</button>
          </div>
          
          <div className="space-y-5">
            {items.map((item, idx) => {
              const product = getProduct(item);
              const min = product?.min_quantity || 1, max = product?.max_quantity || 10000;
              return (
                <div key={idx} className="border border-stone-200 dark:border-stone-800 rounded-2xl p-5 bg-stone-50/80 dark:bg-stone-800/50 transition-colors duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Product *</label>
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
                      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Quantity * {product && <span className="text-xs font-normal text-stone-400">({min}-{max})</span>}</label>
                      <input type="number" min={min} max={max} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Math.max(min, Math.min(max, parseInt(e.target.value) || min)))} className={inputClass} required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Subtotal</label>
                      <div className="px-3.5 py-2.5 bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-bold">{fmtCurrency((product?.price || 0) * item.quantity)}</div>
                    </div>
                  </div>
                  
                  {product?.fields?.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-stone-200 dark:border-stone-700">
                      <button type="button" onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle("hidden")} className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4 hover:text-[#c2410c] dark:hover:text-[#ea580c] transition-colors"><ChevronDown className="w-4 h-4" /> Specifications ({product.fields.length})</button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {product.fields.map((f) => (
                          <div key={f.id}>
                            <label className="block text-sm text-stone-600 dark:text-stone-400 mb-1.5 font-medium">{f.name}{f.required && <span className="text-[#c2410c] ml-1">*</span>}</label>
                            <FieldInput field={f} value={item._fv?.[f.id]} onChange={(v) => setField(idx, f.id, v)} />
                            {f.help_text && f.field_type !== "checkbox" && <p className="text-xs text-stone-400 mt-1.5">{f.help_text}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Notes</label>
                    <input type="text" value={item.notes} onChange={(e) => updateItem(idx, "notes", e.target.value)} placeholder="Special instructions..." className={inputClass} />
                  </div>
                  
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="mt-4 text-sm font-semibold text-red-500 dark:text-red-400 flex items-center gap-1.5 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /> Remove</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Design Section */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-2">Design Files</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Do you have your own design, or do you need us to create one?</p>

          {/* Option 1: Upload own design */}
          <div onClick={() => setOrderDetails((p) => ({ ...p, needs_design: false }))}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 mb-4 ${!orderDetails.needs_design ? "border-[#c2410c]/40 bg-[#fff7ed] dark:bg-[#c2410c]/10 shadow-sm shadow-[#c2410c]/10" : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${!orderDetails.needs_design ? "bg-[#c2410c] border-[#c2410c]" : "border-stone-300 dark:border-stone-600"}`}>
                {!orderDetails.needs_design && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200">I have my own design</span>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Upload your print-ready files below</p>
              </div>
            </div>

            {!orderDetails.needs_design && (
              <div className="mt-5 space-y-4">
                <div className="relative border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-2xl p-8 text-center hover:border-[#c2410c]/50 transition-colors cursor-pointer bg-stone-50/50 dark:bg-stone-800/30">
                  <Upload className="w-10 h-10 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">Click to upload or drag & drop</p>
                  <p className="text-xs text-stone-400 mt-1">PDF, PNG, JPG, AI, PSD accepted</p>
                  <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.ai,.psd" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                
                {orderDetails.client_files.length > 0 && (
                  <div className="space-y-2">
                    {orderDetails.client_files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center"><FileText className="w-5 h-5 text-[#c2410c]" /></div>
                          <div>
                            <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{f.name}</span>
                            <span className="text-xs text-stone-400 block">{(f.size / 1024).toFixed(1)}KB</span>
                          </div>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeClientFile(i); }} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Option 2: Request design */}
          <div onClick={() => setOrderDetails((p) => ({ ...p, needs_design: true }))}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${orderDetails.needs_design ? "border-[#c2410c]/40 bg-[#fff7ed] dark:bg-[#c2410c]/10 shadow-sm shadow-[#c2410c]/10" : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${orderDetails.needs_design ? "bg-[#c2410c] border-[#c2410c]" : "border-stone-300 dark:border-stone-600"}`}>
                {orderDetails.needs_design && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200">I need a design created</span>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Our designer will create artwork for you</p>
              </div>
            </div>

            {orderDetails.needs_design && (
              <div className="mt-5">
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Describe what you need designed *</label>
                <textarea value={orderDetails.design_description} onChange={(e) => setOrderDetails((p) => ({ ...p, design_description: e.target.value }))} rows={4} placeholder="E.g., Business card with company logo, blue and white theme, include phone number and email address..." className={inputClass} />
                <p className="text-xs text-stone-400 mt-2 font-medium">Be as detailed as possible so the designer understands your requirements</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-6 transition-colors duration-300">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-5">Additional Details</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Order Notes</label>
              <textarea value={orderDetails.description} onChange={(e) => setOrderDetails((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Any additional notes about this order..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Priority</label>
              <select value={orderDetails.priority} onChange={(e) => setOrderDetails((p) => ({ ...p, priority: e.target.value }))} className={inputClass}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#fff7ed] dark:bg-[#c2410c]/5 border border-[#c2410c]/15 dark:border-[#c2410c]/20 rounded-2xl p-6 transition-colors duration-300">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 mb-5"><div className="w-8 h-8 rounded-lg bg-[#c2410c]/10 flex items-center justify-center"><Calculator className="w-4 h-4 text-[#c2410c]" /></div> Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-stone-500 dark:text-stone-400">Subtotal ({items.filter((i) => i.product).length} items)</span><span className="font-bold text-stone-900 dark:text-stone-100">{fmtCurrency(total)}</span></div>
            <div className="flex justify-between"><span className="text-[#c2410c] dark:text-[#ea580c] font-semibold">Deposit (70%)</span><span className="font-black text-[#c2410c] dark:text-[#ea580c]">{fmtCurrency(Math.round(total * 0.7))}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">Balance (30%)</span><span className="text-stone-600 dark:text-stone-300 font-medium">{fmtCurrency(Math.round(total * 0.3))}</span></div>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-500 mt-5 leading-relaxed">70% deposit must be paid before work begins. Invoice will be generated automatically.</p>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate("/app/orders")} className="flex-1 py-3.5 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[.98] transition-all">
            Cancel
          </button>
          <button type="submit" disabled={isLoading || items.every((i) => !i.product)} className="flex-1 py-3.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-xl font-bold hover:from-[#92400e] hover:to-[#c2410c] disabled:opacity-50 shadow-lg shadow-orange-600/20 active:scale-[.98] transition-all">
            {isLoading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;