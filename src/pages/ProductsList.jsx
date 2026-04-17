import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchCategories, createCategory,
} from "@/store/slices/productsSlice";
import toast from "react-hot-toast";
import {
  Package, Plus, FolderPlus, Edit, Trash2,
  ShoppingCart, X, Minus, LayoutGrid, ImageIcon,
} from "lucide-react";

const CART_KEY = "printing_order_cart";
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

const FieldInput = ({ field, value, onChange }) => {
  const cls = "w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none text-sm transition-all";
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
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" checked={value || false} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-5 h-5 bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md peer-checked:bg-[#c2410c] peer-checked:border-[#c2410c] transition-colors" />
        <svg className="w-3 h-3 text-white absolute top-[3px] left-[3px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <span className="text-sm text-stone-600 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">{field.help_text || field.name}</span>
    </label>
  );
  if (field.field_type === "file") return (
    <div>
      <input type="file" onChange={(e) => e.target.files[0] && onChange(e.target.files[0].name)}
        className="w-full text-sm text-stone-500 dark:text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#fff7ed] dark:file:bg-[#c2410c]/15 file:text-[#c2410c] dark:file:text-[#ea580c] hover:file:bg-orange-100 dark:hover:file:bg-[#c2410c]/25 cursor-pointer" />
      {value && <p className="text-xs text-stone-500 mt-1.5 font-medium">Selected: {value}</p>}
    </div>
  );
  const type = { number: "number", email: "email", phone: "tel", date: "date" }[field.field_type] || "text";
  return <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} className={cls} />;
};

const inputClass = "w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none transition-all text-sm";

// ─── Product Image Component ───────────────────────────
const ProductImage = ({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-stone-100 dark:bg-stone-800">
      {!loaded && !errored && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 dark:from-stone-700 dark:via-stone-800 dark:to-stone-700"
          style={{ backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}
        />
      )}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-800">
          <div className="w-12 h-12 rounded-2xl bg-stone-200/80 dark:bg-stone-700 flex items-center justify-center mb-2">
            <ImageIcon className="w-6 h-6 text-stone-400 dark:text-stone-500" />
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">No image</p>
        </div>
      )}
      {!errored && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{ objectFit: "cover" }}
          className={`w-full h-full transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} ${className}`}
        />
      )}
      {!errored && loaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.06] via-transparent to-transparent pointer-events-none" />
      )}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
const ProductsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, isLoading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", description: "", image: null });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemForm, setItemForm] = useState({ quantity: 1, notes: "", fieldValues: {} });
  const [cart, setCart] = useState(getCart);
  const updateCart = (items) => { setCart(items); saveCart(items); };
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

  const handleCategoryFilter = (catId = null) => {
    setActiveCategory(catId);
    dispatch(catId ? fetchProducts({ category: catId }) : fetchProducts());
  };

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

  const openDeleteModal = (id) => { setDeletingProductId(id); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!deletingProductId) return;
    const r = await dispatch(deleteProduct(deletingProductId));
    if (deleteProduct.fulfilled.match(r)) {
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      setDeletingProductId(null);
      dispatch(fetchProducts());
    } else toast.error("Failed to delete product");
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
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Products</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Browse and add products to your order</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          {cart.length > 0 && (
            <button onClick={() => navigate("/app/orders/new")} className="relative flex items-center gap-2 px-4 py-2.5 bg-[#1c1917] dark:bg-stone-800 hover:bg-[#c2410c] text-white rounded-xl shadow-sm shadow-stone-900/10 dark:shadow-black/20 transition-colors active:scale-[.98]">
              <ShoppingCart className="w-4 h-4" /> Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#c2410c] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm shadow-[#c2410c]/30">
                {(cartTotal / 1000).toFixed(0)}k
              </span>
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors active:scale-[.98]">
                <FolderPlus className="w-4 h-4" /> Category
              </button>
              <button onClick={() => { setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: null }); setShowProductModal(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white px-4 py-2.5 rounded-xl shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 active:scale-[.98] transition-all">
                <Plus className="w-4 h-4" /> Product
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="bg-[#fff7ed] dark:bg-[#c2410c]/5 border border-[#c2410c]/15 dark:border-[#c2410c]/20 rounded-2xl p-4 transition-colors duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#c2410c]/10 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-[#c2410c]" />
              </div>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{cart.length} item{cart.length > 1 ? "s" : ""} — KES {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { updateCart([]); toast.success("Cart cleared"); }} className="text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 transition-colors">Clear All</button>
              <button onClick={() => navigate("/orders/new")} className="px-4 py-2 bg-[#1c1917] dark:bg-stone-800 hover:bg-[#c2410c] text-white rounded-xl text-sm font-bold transition-colors shadow-sm">Checkout</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {cart.map((item) => (
              <span key={item.cartId} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-stone-800 rounded-xl text-xs border border-[#c2410c]/15 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium shadow-sm">
                {item.product_name} x{item.quantity}
                <button onClick={() => { updateCart(cart.filter((c) => c.cartId !== item.cartId)); }} className="ml-1 text-red-400 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 p-4 sm:p-6 transition-colors duration-300">
        <h2 className="font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-[#c2410c]" />
          </div>
          Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryFilter(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeCategory === null
                ? "bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 shadow-md shadow-stone-900/15 dark:shadow-white/10"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
            }`}
          >All</button>
          {categories?.length === 0 ? <p className="text-stone-500 text-sm">No categories yet</p> : (
            categories.map((cat) => (
              <button key={cat.id} onClick={() => handleCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 shadow-md shadow-stone-900/15 dark:shadow-white/10"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >{cat.name}</button>
            ))
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          <div className="col-span-full text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-[#c2410c] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : products?.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mx-auto mb-4"><Package className="w-7 h-7 text-stone-300 dark:text-stone-600" /></div>
            <p className="font-semibold text-stone-600 dark:text-stone-400">No products yet</p>
          </div>
        ) : products.map((product) => {
          const inCart = cart.some((c) => c.product === product.id);
          return (
            <div key={product.id} className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm shadow-stone-200/30 dark:shadow-black/10 border border-stone-200/70 dark:border-stone-800 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-stone-900/30 transition-all duration-300 flex flex-col group">
              
              {/* Product Image — fixed height, consistent size */}
              <div className="relative w-full">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="group-hover:scale-105"
                />
                <span className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-lg bg-white/90 dark:bg-stone-900/80 backdrop-blur-md text-stone-700 dark:text-stone-300 border border-white/50 dark:border-stone-700/50 font-semibold shadow-sm z-10">
                  {product.category_name || "General"}
                </span>
                {product.production_time && (
                  <span className="absolute bottom-3 left-3 text-[11px] px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white font-medium shadow-sm flex items-center gap-1 z-10">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {product.production_time}h
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg leading-tight">{product.name}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 flex-1 line-clamp-2 leading-relaxed">{product.description || "No description"}</p>
                {product.fields?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {product.fields.slice(0, 3).map((f) => <span key={f.id} className="text-xs px-2.5 py-0.5 bg-[#fff7ed] dark:bg-[#c2410c]/10 text-[#c2410c] dark:text-[#ea580c] rounded-md font-semibold">{f.name}</span>)}
                    {product.fields.length > 3 && <span className="text-xs px-2.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-md font-medium">+{product.fields.length - 3}</span>}
                  </div>
                )}
                <p className="text-xs text-stone-400 dark:text-stone-600 mt-2.5 font-medium">Min: {product.min_quantity || 1} · Max: {product.max_quantity || 10000}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight">KES {(product.price || 0).toLocaleString()}</span>
                  <button onClick={() => openAddModal(product)} className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 ${inCart ? "bg-[#fff7ed] dark:bg-[#c2410c]/10 text-[#c2410c] dark:text-[#ea580c] border border-[#c2410c]/15 dark:border-[#c2410c]/20" : "bg-[#1c1917] dark:bg-white hover:bg-[#c2410c] dark:hover:bg-[#c2410c] dark:hover:text-white text-white dark:text-stone-900 shadow-sm shadow-stone-900/10 dark:shadow-white/10"}`}>
                    {inCart ? <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> In Cart</span> : "Select Design"}
                  </button>
                </div>
                {isAdmin && (
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <button onClick={() => openEdit(product)} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><Edit className="w-4 h-4 text-stone-500 dark:text-stone-400" /></button>
                    <button onClick={() => openDeleteModal(product.id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Add-to-Order Modal ─── */}
      {showAddModal && selectedProduct && (
        <div className="fixed inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Add to Order</h3>
                <button onClick={() => setShowAddModal(false)} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors active:scale-95"><X className="w-5 h-5 text-stone-500" /></button>
              </div>
              <div className="flex gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <ProductImage src={selectedProduct.image} alt={selectedProduct.name} className="!h-20" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-stone-800 dark:text-stone-100 truncate">{selectedProduct.name}</p>
                  <p className="text-sm text-[#c2410c] dark:text-[#ea580c] font-bold mt-0.5">KES {selectedProduct.price?.toLocaleString()}</p>
                  {selectedProduct.description && <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 line-clamp-2">{selectedProduct.description}</p>}
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2.5">
                  Quantity * <span className="text-xs font-normal text-stone-400">(Min: {selectedProduct.min_quantity || 1}, Max: {selectedProduct.max_quantity || 10000})</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setItemForm((p) => ({ ...p, quantity: Math.max(selectedProduct.min_quantity || 1, p.quantity - 1) }))}
                    disabled={itemForm.quantity <= (selectedProduct.min_quantity || 1)} className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors active:scale-95"><Minus className="w-4 h-4 text-stone-600 dark:text-stone-400" /></button>
                  <input type="number" value={itemForm.quantity}
                    onChange={(e) => setItemForm((p) => ({ ...p, quantity: Math.max(selectedProduct.min_quantity || 1, Math.min(selectedProduct.max_quantity || 10000, parseInt(e.target.value) || 1)) }))}
                    className="w-24 text-center px-3 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-bold outline-none focus:ring-4 focus:ring-[#c2410c]/10 transition-all" />
                  <button type="button" onClick={() => setItemForm((p) => ({ ...p, quantity: Math.min(selectedProduct.max_quantity || 10000, p.quantity + 1) }))}
                    disabled={itemForm.quantity >= (selectedProduct.max_quantity || 10000)} className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors active:scale-95"><Plus className="w-4 h-4 text-stone-600 dark:text-stone-400" /></button>
                  <div className="flex gap-1.5">
                    {[10, 50, 100, 500].map((q) => (
                      <button key={q} type="button" onClick={() => setItemForm((p) => ({ ...p, quantity: Math.min(selectedProduct.max_quantity || 10000, q) }))}
                        className="px-2.5 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/10 hover:text-[#c2410c] dark:hover:text-[#ea580c] transition-colors font-semibold">{q}</button>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">Subtotal:
                  <span className="font-bold text-stone-900 dark:text-stone-100 ml-1">KES {(selectedProduct.price * itemForm.quantity).toLocaleString()}</span>
                </p>
              </div>

              {selectedProduct.fields?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">Specifications</h4>
                  <div className="space-y-4">
                    {selectedProduct.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm text-stone-600 dark:text-stone-400 mb-1.5 font-medium">{field.name}{field.required && <span className="text-[#c2410c] ml-1">*</span>}</label>
                        <FieldInput field={field} value={itemForm.fieldValues[field.id]} onChange={(v) => setItemForm((p) => ({ ...p, fieldValues: { ...p.fieldValues, [field.id]: v } }))} />
                        {field.help_text && field.field_type !== "checkbox" && <p className="text-xs text-stone-400 mt-1.5">{field.help_text}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">Notes / Special Instructions</label>
                <textarea value={itemForm.notes} onChange={(e) => setItemForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..." rows={3} className={inputClass} />
              </div>

              {selectedProduct.requires_design && (
                <div className="p-3.5 bg-[#fff7ed] dark:bg-[#c2410c]/5 border border-[#c2410c]/15 dark:border-[#c2410c]/20 rounded-xl">
                  <p className="text-sm text-[#c2410c] dark:text-[#ea580c] font-medium"><strong>Design Required:</strong> Provide details during checkout.</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-semibold active:scale-[.98]">Cancel</button>
                <button type="button" onClick={handleAddToCart} className="flex-1 px-4 py-2.5 bg-[#1c1917] dark:bg-white hover:bg-[#c2410c] dark:hover:bg-[#c2410c] dark:hover:text-white text-white dark:text-stone-900 rounded-xl font-bold shadow-lg shadow-stone-900/10 dark:shadow-white/10 transition-colors active:scale-[.98]">
                  <span className="flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4" /> Select Design</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Product Create/Edit Modal ─── */}
      {showProductModal && (
        <div className="fixed inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 dark:border-stone-800 p-6 transition-colors duration-300">
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-5">{editingProduct ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleProductSubmit} className="space-y-4" encType="multipart/form-data">
              {(editingProduct?.image || productForm.image) && (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                  <ProductImage
                    src={productForm.image instanceof File ? URL.createObjectURL(productForm.image) : editingProduct?.image}
                    alt="Preview"
                    className="!h-40"
                  />
                </div>
              )}
              <input type="text" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className={inputClass} />
              <div className="flex gap-2">
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className={`flex-1 ${inputClass}`}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowCategoryModal(true)} className="w-11 h-11 flex items-center justify-center bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors active:scale-95">+</button>
              </div>
              <input type="number" step="0.01" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={inputClass} />
              <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={inputClass} rows="2" />
              <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && setProductForm({ ...productForm, image: e.target.files[0] })}
                className="w-full text-sm text-stone-500 dark:text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#fff7ed] dark:file:bg-[#c2410c]/15 file:text-[#c2410c] dark:file:text-[#ea580c] hover:file:bg-orange-100 dark:hover:file:bg-[#c2410c]/25 cursor-pointer" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowProductModal(false); setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: null }); }} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-semibold active:scale-[.98]">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-[.98]">{editingProduct ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Category Modal ─── */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 dark:border-stone-800 p-6 transition-colors duration-300">
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-5">Add Category</h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <input type="text" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className={inputClass} />
              <textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className={inputClass} rows="2" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-semibold active:scale-[.98]">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-[.98]">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-sm border border-stone-200 dark:border-stone-800 p-6 text-center transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100 mb-2">Delete Product</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeletingProductId(null); }}
                className="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-semibold active:scale-[.98]">Cancel</button>
              <button onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all font-bold active:scale-[.98]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;