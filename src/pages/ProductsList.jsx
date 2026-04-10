import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchCategories, createCategory,
} from "@/store/slices/productsSlice";
import toast from "react-hot-toast";
import {
  Package, Plus, FolderPlus, Folder, Edit, Trash2,
  ShoppingCart, X, Minus, LayoutGrid,
} from "lucide-react";

const CART_KEY = "printing_order_cart";
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

const FieldInput = ({ field, value, onChange }) => {
  const cls = "w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm transition-colors";
  const ph = field.placeholder || field.name;

  if (field.field_type === "select") return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={cls}>
      <option value="">Select {field.name}</option>
      {field.options?.map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  );
  if (field.field_type === "textarea") return (
    <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} rows={2} className={cls} />
  );
  if (field.field_type === "checkbox") return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={value || false} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600" />
      <span className="text-sm text-slate-600 dark:text-slate-400">{field.help_text || field.name}</span>
    </label>
  );
  if (field.field_type === "file") return (
    <div>
      <input type="file" onChange={(e) => e.target.files[0] && onChange(e.target.files[0].name)}
        className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 dark:file:bg-cyan-900/30 file:text-cyan-700 dark:file:text-cyan-400 hover:file:bg-cyan-100 cursor-pointer" />
      {value && <p className="text-xs text-slate-500 mt-1">Selected: {value}</p>}
    </div>
  );
  const type = { number: "number", email: "email", phone: "tel", date: "date" }[field.field_type] || "text";
  return <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} className={cls} />;
};

const inputClass = "w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-colors";

const ProductsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, isLoading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  // Admin CRUD state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", description: "", image: null });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  // Add-to-order state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemForm, setItemForm] = useState({ quantity: 1, notes: "", fieldValues: {} });

  // Cart
  const [cart, setCart] = useState(getCart);
  const updateCart = (items) => { setCart(items); saveCart(items); };
  
  // Category Filter State
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);
  useEffect(() => {
    const sync = () => setCart(getCart());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Category handler
  const handleCategoryFilter = (catId = null) => {
    setActiveCategory(catId);
    if (catId) {
      dispatch(fetchProducts({ category: catId }));
    } else {
      dispatch(fetchProducts());
    }
  };

  // Admin handlers 
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) return toast.error("Product name is required");
    if (!productForm.price) return toast.error("Price is required");
    const fd = new FormData();
    fd.append("name", productForm.name);
    fd.append("price", parseFloat(productForm.price));
    fd.append("is_active", true);
    if (productForm.category) fd.append("category", Number(productForm.category));
    fd.append("description", productForm.description || "");
    if (productForm.image instanceof File) fd.append("image", productForm.image);

    try {
      const result = editingProduct
        ? await dispatch(updateProduct({ id: editingProduct.id, data: fd }))
        : await dispatch(createProduct(fd));
      const action = editingProduct ? updateProduct : createProduct;
      if (action.fulfilled.match(result)) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: "", category: "", price: "", description: "", image: null });
        dispatch(fetchProducts());
      } else toast.error(result.payload || "Failed");
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const r = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(r)) toast.success("Deleted");
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return toast.error("Category name required");
    const r = await dispatch(createCategory(categoryForm));
    if (createCategory.fulfilled.match(r)) {
      toast.success("Category created");
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "" });
      dispatch(fetchCategories());
    } else toast.error(r.payload || "Failed");
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, category: p.category_id || "", price: p.price, description: p.description || "", image: null });
    setShowProductModal(true);
  };

  // Add-to-order handlers 
  const openAddModal = (product) => {
    setSelectedProduct(product);
    const fv = {};
    (product.fields || []).forEach((f) => { fv[f.id] = f.field_type === "checkbox" ? false : ""; });
    setItemForm({ quantity: product.min_quantity || 1, notes: "", fieldValues: fv });
    setShowAddModal(true);
  };

  const handleAddToCart = () => {
    const missing = (selectedProduct.fields || []).filter((f) => f.required && !itemForm.fieldValues[f.id] && itemForm.fieldValues[f.id] !== false);
    if (missing.length) return toast.error(`Required: ${missing.map((f) => f.name).join(", ")}`);
    updateCart([...cart, {
      cartId: Date.now() + Math.random(),
      product: selectedProduct.id,
      product_name: selectedProduct.name,
      product_price: selectedProduct.price,
      product_image: selectedProduct.image,
      quantity: itemForm.quantity,
      notes: itemForm.notes,
      fieldValues: itemForm.fieldValues,
      fieldDefinitions: selectedProduct.fields || [],
    }]);
    setShowAddModal(false);
    toast.success(`${selectedProduct.name} added to order`);
  };

  const cartTotal = cart.reduce((s, i) => s + i.product_price * i.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-slate-500 dark:text-slate-400">Browse and add products to your order</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {cart.length > 0 && (
            <button onClick={() => navigate("/app/orders/new")} className="relative flex items-center gap-2 px-4 py-2 bg-[#0f172a] dark:bg-slate-700 hover:bg-[#0891b2] text-white rounded-lg shadow-sm transition-colors">
              <ShoppingCart className="w-4 h-4" /> Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#06b6d4] text-white text-xs rounded-full flex items-center justify-center">
                {(cartTotal / 1000).toFixed(0)}k
              </span>
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <FolderPlus className="w-4 h-4" /> Category
              </button>
              <button onClick={() => { setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: null }); setShowProductModal(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#6366f1] text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> Product
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-[#0891b2] dark:text-cyan-400" />
              <span className="font-medium text-cyan-800 dark:text-cyan-300">{cart.length} item{cart.length > 1 ? "s" : ""} — KES {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { updateCart([]); toast.success("Cart cleared"); }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700">Clear All</button>
              <button onClick={() => navigate("/orders/new")} className="px-4 py-2 bg-[#0f172a] hover:bg-[#0891b2] text-white rounded-lg text-sm font-medium transition-colors">Checkout</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {cart.map((item) => (
              <span key={item.cartId} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs border border-cyan-200 dark:border-cyan-700 text-slate-700 dark:text-slate-300">
                {item.product_name} x{item.quantity}
                <button onClick={() => { updateCart(cart.filter((c) => c.cartId !== item.cartId)); }} className="ml-1 text-red-500"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-[#06b6d4]" /> Categories</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleCategoryFilter(null)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeCategory === null
                ? "bg-[#0f172a] text-white shadow-md shadow-slate-900/20"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            All
          </button>
          {categories?.length === 0 ? <p className="text-slate-500 dark:text-slate-400 text-sm">No categories yet</p> : (
            categories.map((cat) => (
              <button key={cat.id} onClick={() => handleCategoryFilter(cat.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-[#0f172a] text-white shadow-md shadow-slate-900/20"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#06b6d4] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : products?.length === 0 ? (
          <div className="col-span-full text-center py-12"><Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" /><p className="text-slate-500 dark:text-slate-400">No products yet</p></div>
        ) : products.map((product) => {
          const inCart = cart.some((c) => c.product === product.id);
          return (
            <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all flex flex-col">
              <div className="relative h-44 w-full overflow-hidden bg-slate-50 dark:bg-slate-700">
                <img src={product.image || "https://via.placeholder.com/400x300"} alt={product.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">{product.category_name || "General"}</span>
                {product.production_time && <span className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded-full bg-black/60 text-white">{product.production_time}h</span>}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight">{product.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex-1 line-clamp-2">{product.description || "No description"}</p>
                {product.fields?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.fields.slice(0, 3).map((f) => <span key={f.id} className="text-xs px-2 py-0.5 bg-cyan-50 dark:bg-cyan-900/20 text-[#0891b2] dark:text-cyan-400 rounded">{f.name}</span>)}
                    {product.fields.length > 3 && <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded">+{product.fields.length - 3}</span>}
                  </div>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Min: {product.min_quantity || 1} · Max: {product.max_quantity || 10000}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">KES {(product.price || 0).toLocaleString()}</span>
                  <button onClick={() => openAddModal(product)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${inCart ? "bg-cyan-50 dark:bg-cyan-900/20 text-[#0891b2] dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700" : "bg-[#0f172a] hover:bg-[#0891b2] text-white"}`}>
                    {inCart ? <span className="flex items-center gap-1"><ShoppingCart className="w-4 h-4" /> In Cart</span> : "Select Design"}
                  </button>
                </div>
                {isAdmin && (
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => openEdit(product)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                      <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                      <Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add-to-Order Modal */}
      {showAddModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Add to Order</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-4">
                <img src={selectedProduct.image || "https://via.placeholder.com/80"} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedProduct.name}</p>
                  <p className="text-sm text-[#0891b2] dark:text-cyan-400 font-semibold">KES {selectedProduct.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quantity * <span className="text-xs text-slate-400">(Min: {selectedProduct.min_quantity || 1}, Max: {selectedProduct.max_quantity || 10000})</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setItemForm((p) => ({ ...p, quantity: Math.max(selectedProduct.min_quantity || 1, p.quantity - 1) }))}
                    disabled={itemForm.quantity <= (selectedProduct.min_quantity || 1)} className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"><Minus className="w-4 h-4" /></button>
                  <input type="number" value={itemForm.quantity}
                    onChange={(e) => setItemForm((p) => ({ ...p, quantity: Math.max(selectedProduct.min_quantity || 1, Math.min(selectedProduct.max_quantity || 10000, parseInt(e.target.value) || 1)) }))}
                    className="w-24 text-center px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-cyan-500" />
                  <button type="button" onClick={() => setItemForm((p) => ({ ...p, quantity: Math.min(selectedProduct.max_quantity || 10000, p.quantity + 1) }))}
                    disabled={itemForm.quantity >= (selectedProduct.max_quantity || 10000)} className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"><Plus className="w-4 h-4" /></button>
                  <div className="flex gap-1">
                    {[10, 50, 100, 500].map((q) => (
                      <button key={q} type="button" onClick={() => setItemForm((p) => ({ ...p, quantity: Math.min(selectedProduct.max_quantity || 10000, q) }))}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-[#0891b2] transition-colors">
                          {q}</button>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Subtotal: 
                  <span className="font-semibold text-slate-900 dark:text-white">
                  KES {(selectedProduct.price * itemForm.quantity).toLocaleString()}
                  </span></p>
              </div>

              {selectedProduct.fields?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Specifications</h4>
                  <div className="space-y-4">
                    {selectedProduct.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{field.name}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
                        <FieldInput field={field} value={itemForm.fieldValues[field.id]} onChange={(v) => setItemForm((p) => ({ ...p, fieldValues: { ...p.fieldValues, [field.id]: v } }))} />
                        {field.help_text && field.field_type !== "checkbox" && <p className="text-xs text-slate-400 mt-1">{field.help_text}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes / Special Instructions</label>
                <textarea value={itemForm.notes} onChange={(e) => setItemForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..." rows={3} className={inputClass} />
              </div>

              {selectedProduct.requires_design && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300"><strong>Design Required:</strong> Provide details during checkout.</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="button" onClick={handleAddToCart} className="flex-1 px-4 py-2.5 bg-[#0f172a] hover:bg-[#0891b2] text-white rounded-lg font-medium shadow-sm transition-colors">
                  <span className="flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4" /> Select Design</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleProductSubmit} className="space-y-4" encType="multipart/form-data">
              <input type="text" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className={inputClass} />
              <div className="flex gap-2">
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className={`flex-1 ${inputClass}`}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowCategoryModal(true)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors">+</button>
              </div>
              <input type="number" step="0.01" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={inputClass} />
              <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={inputClass} rows="2" />
              <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && setProductForm({ ...productForm, image: e.target.files[0] })}
                className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 dark:file:bg-cyan-900/30 file:text-cyan-700 dark:file:text-cyan-400 hover:file:bg-cyan-100 cursor-pointer" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowProductModal(false); setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: null }); }} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded-lg shadow-sm transition-colors">{editingProduct ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Add Category</h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <input type="text" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className={inputClass} />
              <textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className={inputClass} rows="2" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded-lg shadow-sm transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;