import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchCategories, createCategory, updateCategory, deleteCategory,
  clearError, clearSuccess,
} from "@/store/slices/productsSlice";
import toast from "react-hot-toast";
import {
  Package, Plus, FolderPlus, Edit3, Trash2, ShoppingCart, X,
  Minus, LayoutGrid, ImageIcon, Search, MoreHorizontal, Clock,
  AlertTriangle, Loader2,
} from "lucide-react";

const CART_KEY = "printing_order_cart";
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

const inputCls = "w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none transition-all text-sm";
const labelCls = "block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2";
const fieldCls = "w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-4 focus:ring-[#c2410c]/10 focus:border-[#c2410c]/40 outline-none text-sm transition-all";

const FieldInput = ({ field, value, onChange }) => {
  const ph = field.placeholder || field.name;
  if (field.field_type === "select")
    return (
      <select value={value || ""} onChange={e => onChange(e.target.value)} className={fieldCls}>
        <option value="">Select {field.name}</option>
        {field.options?.map((o, i) => <option key={i} value={o}>{o}</option>)}
      </select>
    );
  if (field.field_type === "textarea")
    return <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={ph} rows={2} className={fieldCls} />;
  if (field.field_type === "checkbox")
    return (
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className="relative">
          <input type="checkbox" checked={value || false} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
          <div className="w-5 h-5 bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md peer-checked:bg-[#c2410c] peer-checked:border-[#c2410c] transition-colors" />
          <svg className="w-3 h-3 text-white absolute top-[3px] left-[3px] opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm text-stone-600 dark:text-stone-400">{field.help_text || field.name}</span>
      </label>
    );
  if (field.field_type === "file")
    return (
      <div>
        <input type="file" onChange={e => e.target.files[0] && onChange(e.target.files[0].name)} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#fff7ed] file:text-[#c2410c] cursor-pointer" />
        {value && <p className="text-xs text-stone-500 mt-1.5">Selected: {value}</p>}
      </div>
    );
  const type = { number: "number", email: "email", phone: "tel", date: "date" }[field.field_type] || "text";
  return <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={ph} className={fieldCls} />;
};

const ProductImage = ({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  return (
    <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-stone-100 dark:bg-stone-800">
      {!loaded && !errored && <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 dark:from-stone-700 dark:via-stone-800 dark:to-stone-700" style={{ backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-800">
          <div className="w-12 h-12 rounded-2xl bg-stone-200/80 dark:bg-stone-700 flex items-center justify-center mb-2">
            <ImageIcon className="w-6 h-6 text-stone-400" />
          </div>
          <p className="text-[11px] text-stone-400 font-medium">No image</p>
        </div>
      )}
      {!errored && <img src={src} alt={alt} onLoad={() => setLoaded(true)} onError={() => setErrored(true)} style={{ objectFit: "cover" }} className={`w-full h-full transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} ${className}`} />}
      {!errored && loaded && <div className="absolute inset-0 bg-gradient-to-t from-black/[0.06] via-transparent to-transparent pointer-events-none" />}
    </div>
  );
};

const SkeletonCard = ({ index }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/70 dark:border-stone-800 overflow-hidden" style={{ opacity: 0, animation: `fadeUp 0.4s ${index * 60}ms ease-out forwards` }}>
    <div className="w-full h-48 bg-stone-100 dark:bg-stone-800 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-5 w-3/4 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
      <div className="h-3 w-full rounded-lg bg-stone-50 dark:bg-stone-800/60 animate-pulse" />
      <div className="flex justify-between items-center pt-3 border-t border-stone-100 dark:border-stone-800">
        <div className="h-6 w-24 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
        <div className="h-9 w-28 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
      </div>
    </div>
  </div>
);

const CategoryPill = ({ cat, isActive, onClick, productCount, isAdmin, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const activeCls = "bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 shadow-md";
  const inactiveCls = "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700";
  const badgeActive = "bg-white/20 dark:bg-stone-900/20 text-white dark:text-stone-900";
  const badgeInactive = "bg-stone-200/80 dark:bg-stone-700/80 text-stone-400 dark:text-stone-500";
  return (
    <div className="relative group inline-flex">
      <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${isActive ? activeCls : inactiveCls}`}>
        {cat.name}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tabular-nums ${isActive ? badgeActive : badgeInactive}`}>{productCount}</span>
      </button>
      {isAdmin && (
        <button type="button" onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-[#c2410c] hover:border-[#c2410c]/30 z-10 transition-all sm:opacity-0 sm:group-hover:opacity-100 active:scale-95">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      )}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-20 w-40 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xl overflow-hidden" style={{ animation: "dropdownIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <button type="button" onClick={() => { onEdit(cat); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm flex items-center gap-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 font-semibold">
              <Edit3 className="w-4 h-4 text-stone-400" /> Rename
            </button>
            <div className="border-t border-stone-100 dark:border-stone-700" />
            <button type="button" onClick={() => { onDelete(cat); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-sm flex items-center gap-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-semibold">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const DeleteModal = ({ title, message, warning, zIndex = "z-50", onConfirm, onCancel }) => (
  <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 overlay-anim`}>
    <div className="absolute inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-md" onClick={onCancel} />
    <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/60 dark:border-stone-700 w-full max-w-sm p-6 text-center modal-anim">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center mx-auto mb-5">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="font-bold text-xl text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-2 leading-relaxed">{message}</p>
      <p className="text-xs text-red-400 mb-8">{warning || "This action cannot be undone."}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm active:scale-[0.98]">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg font-bold text-sm active:scale-[0.98]">Delete</button>
      </div>
    </div>
  </div>
);

const ProductsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, isLoading, successMessage, error } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", description: "", image: null });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemForm, setItemForm] = useState({ quantity: 1, notes: "", fieldValues: {} });

  const [cart, setCart] = useState(getCart);
  const updateCart = items => { setCart(items); saveCart(items); };

  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { dispatch(fetchProducts()); dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => { if (successMessage) { toast.success(successMessage); dispatch(clearSuccess()); } }, [successMessage, dispatch]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);
  useEffect(() => { const sync = () => setCart(getCart()); window.addEventListener("storage", sync); return () => window.removeEventListener("storage", sync); }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    (products || []).forEach(p => { const cid = p.category_id || p.category; if (cid) counts[cid] = (counts[cid] || 0) + 1; });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!search) return products || [];
    const q = search.toLowerCase();
    return (products || []).filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }, [products, search]);

  const handleCategoryFilter = (catId = null) => {
    setActiveCategory(catId);
    dispatch(catId ? fetchProducts({ category: catId }) : fetchProducts());
  };

  const closeProductModal = () => { setShowProductModal(false); setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: null }); };

  const handleProductSubmit = async e => {
    e.preventDefault();
    if (!productForm.name.trim()) return toast.error("Product name is required");
    if (!productForm.price) return toast.error("Price is required");
    setProductSaving(true);
    const fd = new FormData();
    fd.append("name", productForm.name);
    fd.append("price", parseFloat(productForm.price));
    fd.append("is_active", true);
    if (productForm.category) fd.append("category", Number(productForm.category));
    fd.append("description", productForm.description || "");
    if (productForm.image instanceof File) fd.append("image", productForm.image);
    const result = editingProduct
      ? await dispatch(updateProduct({ id: editingProduct.id, data: fd }))
      : await dispatch(createProduct(fd));
    const action = editingProduct ? updateProduct : createProduct;
    if (action.fulfilled.match(result)) { toast.success(editingProduct ? "Product updated" : "Product created"); closeProductModal(); dispatch(fetchProducts()); }
    else toast.error(result.payload || "Failed");
    setProductSaving(false);
  };

  const confirmDeleteProduct = async () => {
    const r = await dispatch(deleteProduct(deletingProduct.id));
    if (deleteProduct.fulfilled.match(r)) { toast.success("Product deleted"); setDeletingProduct(null); dispatch(fetchProducts()); }
    else toast.error("Failed to delete product");
  };

  const closeCategoryModal = () => { setShowCategoryModal(false); setEditingCategory(null); setCategoryForm({ name: "", description: "" }); };

  const handleCategorySubmit = async e => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return toast.error("Category name required");
    setCategorySaving(true);
    const r = editingCategory
      ? await dispatch(updateCategory({ id: editingCategory.id, data: categoryForm }))
      : await dispatch(createCategory(categoryForm));
    const action = editingCategory ? updateCategory : createCategory;
    if (action.fulfilled.match(r)) { toast.success(editingCategory ? "Category updated" : "Category created"); closeCategoryModal(); dispatch(fetchCategories()); }
    else toast.error(r.payload || "Failed");
    setCategorySaving(false);
  };

  const confirmDeleteCategory = async () => {
    const r = await dispatch(deleteCategory(deletingCategory.id));
    if (deleteCategory.fulfilled.match(r)) {
      toast.success("Category deleted");
      if (activeCategory === deletingCategory.id) handleCategoryFilter(null);
      setDeletingCategory(null);
      dispatch(fetchCategories());
    } else toast.error("Failed to delete category");
  };

  const openEditProduct = p => { setEditingProduct(p); setProductForm({ name: p.name, category: p.category_id || p.category || "", price: p.price, description: p.description || "", image: null }); setShowProductModal(true); };
  const openEditCategory = cat => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || "" }); setShowCategoryModal(true); };

  const openAddModal = product => {
    setSelectedProduct(product);
    const fv = {};
    (product.fields || []).forEach(f => { fv[f.id] = f.field_type === "checkbox" ? false : ""; });
    setItemForm({ quantity: product.min_quantity || 1, notes: "", fieldValues: fv });
    setShowAddModal(true);
  };

  const handleAddToCart = () => {
    const missing = (selectedProduct.fields || []).filter(f => f.required && !itemForm.fieldValues[f.id] && itemForm.fieldValues[f.id] !== false);
    if (missing.length) return toast.error(`Required: ${missing.map(f => f.name).join(", ")}`);
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
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const anim = (delay = 0) => ({ opacity: 0, transform: "translateY(12px)", animation: `fadeUp 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) forwards` });

  const modalHeader = (icon, title, subtitle, onClose) => (
    <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-30 scale-110" />
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/20">{icon}</div>
        </div>
        <div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100">{title}</h3>
          <p className="text-[11px] text-stone-400">{subtitle}</p>
        </div>
      </div>
      <button onClick={onClose} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-all active:scale-95"><X className="w-4 h-4 text-stone-500" /></button>
    </div>
  );

  const btnCancel = onClick => <button type="button" onClick={onClick} className="flex-1 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm active:scale-[0.98]">Cancel</button>;
  const btnPrimary = (label, saving, type = "submit") => (
    <button type={type} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#92400e] hover:to-[#c2410c] text-white rounded-xl shadow-lg shadow-orange-600/20 font-bold text-sm disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2">
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={anim()}>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] blur-lg opacity-25 scale-110" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/20">
                <Package className="w-[18px] h-[18px] text-white" />
              </div>
            </div>
            Products
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 ml-[52px]">Browse and add products to your order</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          {cart.length > 0 && (
            <button onClick={() => navigate("/app/orders/new")} className="relative flex items-center gap-2 px-4 py-2.5 bg-[#1c1917] dark:bg-stone-800 hover:bg-[#c2410c] text-white rounded-xl transition-all active:scale-[0.98]">
              <ShoppingCart className="w-4 h-4" /> Cart ({cartCount})
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-br from-[#c2410c] to-[#ea580c] text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                {cartTotal >= 1000 ? `${(cartTotal / 1000).toFixed(1)}k` : cartTotal}
              </span>
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", description: "" }); setShowCategoryModal(true); }} className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm active:scale-[0.98]">
                <FolderPlus className="w-4 h-4" /> Category
              </button>
              <button onClick={() => { setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: null }); setShowProductModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white rounded-xl shadow-lg shadow-orange-600/20 hover:from-[#92400e] hover:to-[#c2410c] active:scale-[0.98] font-bold text-sm">
                <Plus className="w-4 h-4" /> Product
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cart Bar */}
      {cart.length > 0 && (
        <div className="bg-[#fff7ed] dark:bg-[#c2410c]/5 border border-[#c2410c]/15 dark:border-[#c2410c]/20 rounded-2xl p-4" style={anim(50)}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#c2410c]/10 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-[#c2410c]" /></div>
              <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">{cart.length} item{cart.length > 1 && "s"} — KES {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { updateCart([]); toast.success("Cart cleared"); }} className="text-sm font-medium text-red-500 hover:text-red-600">Clear All</button>
              <button onClick={() => navigate("/app/orders/new")} className="px-4 py-2 bg-[#1c1917] dark:bg-stone-800 hover:bg-[#c2410c] text-white rounded-xl text-sm font-bold active:scale-[0.98]">Checkout</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {cart.map(item => (
              <span key={item.cartId} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-stone-800 rounded-xl text-xs border border-[#c2410c]/15 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                {item.product_name} x{item.quantity}
                <button onClick={() => updateCart(cart.filter(c => c.cartId !== item.cartId))} className="ml-1 text-red-400 hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200/70 dark:border-stone-800 p-4 sm:p-6" style={anim(100)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5 text-sm">
            <div className="w-7 h-7 rounded-lg bg-[#fff7ed] dark:bg-[#c2410c]/10 flex items-center justify-center"><LayoutGrid className="w-4 h-4 text-[#c2410c]" /></div>
            Categories
          </h2>
          {search && (
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-[#c2410c]/30 focus:ring-2 focus:ring-[#c2410c]/5" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-stone-100 dark:bg-stone-700 flex items-center justify-center"><X className="w-3 h-3 text-stone-400" /></button>}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleCategoryFilter(null)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${activeCategory === null ? "bg-[#1c1917] dark:bg-white text-white dark:text-stone-900 shadow-md" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"}`}>
            All <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ml-1 ${activeCategory === null ? "bg-white/20 text-white" : "bg-stone-200/80 text-stone-400"}`}>{products?.length || 0}</span>
          </button>
          {categories?.length === 0 ? (
            <p className="text-stone-500 text-sm">No categories yet{isAdmin && <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", description: "" }); setShowCategoryModal(true); }} className="text-[#c2410c] font-semibold hover:underline ml-1">— create one</button>}</p>
          ) : (
            categories.map(cat => (
              <CategoryPill key={cat.id} cat={cat} isActive={activeCategory === cat.id} onClick={() => handleCategoryFilter(cat.id)} productCount={categoryCounts[cat.id] || 0} isAdmin={isAdmin} onEdit={openEditCategory} onDelete={c => setDeletingCategory(c)} />
            ))
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} index={i} />)
        ) : filteredProducts?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20" style={anim(100)}>
            <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-stone-300 dark:text-stone-600" />
            </div>
            <p className="font-bold text-stone-600 dark:text-stone-400">{search ? "No products match your search" : "No products yet"}</p>
            <p className="text-xs text-stone-400 mt-1.5 text-center max-w-xs">{search ? "Try a different search term" : isAdmin ? "Create your first product to get started" : "No products have been added yet"}</p>
          </div>
        ) : (
          filteredProducts.map((product, i) => {
            const inCart = cart.some(c => c.product === product.id);
            return (
              <div key={product.id} className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200/70 dark:border-stone-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group" style={anim(150 + i * 50)}>
                <div className="relative w-full">
                  <ProductImage src={product.image} alt={product.name} className="group-hover:scale-105" />
                  <span className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-lg bg-white/90 dark:bg-stone-900/80 backdrop-blur-md text-stone-700 dark:text-stone-300 border border-white/50 font-semibold shadow-sm z-10">{product.category_name || "General"}</span>
                  {product.production_time && (
                    <span className="absolute bottom-3 left-3 text-[11px] px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white font-medium flex items-center gap-1 z-10">
                      <Clock className="w-3 h-3" /> {product.production_time}h
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-stone-800 dark:text-stone-100 text-lg leading-tight">{product.name}</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 flex-1 line-clamp-2">{product.description || "No description"}</p>
                  {product.fields?.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {product.fields.slice(0, 3).map(f => <span key={f.id} className="text-xs px-2.5 py-0.5 bg-[#fff7ed] dark:bg-[#c2410c]/10 text-[#c2410c] dark:text-[#ea580c] rounded-md font-semibold">{f.name}</span>)}
                      {product.fields.length > 3 && <span className="text-xs px-2.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-md font-medium">+{product.fields.length - 3}</span>}
                    </div>
                  )}
                  <p className="text-[11px] text-stone-400 dark:text-stone-600 mt-2.5 font-medium">Min: {product.min_quantity || 1} · Max: {product.max_quantity || "∞"}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-xl font-black text-stone-900 dark:text-stone-100 tabular-nums">KES {(product.price || 0).toLocaleString()}</span>
                    <button onClick={() => openAddModal(product)} className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 ${inCart ? "bg-[#fff7ed] dark:bg-[#c2410c]/10 text-[#c2410c] border border-[#c2410c]/15" : "bg-[#1c1917] dark:bg-white hover:bg-[#c2410c] dark:hover:bg-[#c2410c] dark:hover:text-white text-white dark:text-stone-900"}`}>
                      {inCart ? <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> In Cart</span> : "Select Design"}
                    </button>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEditProduct(product)} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95"><Edit3 className="w-4 h-4 text-stone-500" /></button>
                      <button onClick={() => setDeletingProduct(product)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add-to-Order Modal */}
      {showAddModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-anim">
          <div className="absolute inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/60 dark:border-stone-700 w-full max-w-lg max-h-[90vh] overflow-y-auto modal-anim">
            <div className="sticky top-0 bg-white dark:bg-stone-900 p-6 pb-0 border-b border-stone-100 dark:border-stone-800 z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Add to Order</h3>
                <button onClick={() => setShowAddModal(false)} className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center active:scale-95"><X className="w-5 h-5 text-stone-500" /></button>
              </div>
              <div className="flex gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 mb-6">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0"><ProductImage src={selectedProduct.image} alt={selectedProduct.name} className="!h-20" /></div>
                <div className="min-w-0">
                  <p className="font-bold text-stone-800 dark:text-stone-100 truncate">{selectedProduct.name}</p>
                  <p className="text-sm text-[#c2410c] font-bold mt-0.5 tabular-nums">KES {selectedProduct.price?.toLocaleString()}</p>
                  {selectedProduct.description && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{selectedProduct.description}</p>}
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2.5">Quantity * <span className="text-xs font-normal text-stone-400">(Min: {selectedProduct.min_quantity || 1}, Max: {selectedProduct.max_quantity || "∞"})</span></label>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setItemForm(p => ({ ...p, quantity: Math.max(selectedProduct.min_quantity || 1, p.quantity - 1) }))} disabled={itemForm.quantity <= (selectedProduct.min_quantity || 1)} className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 disabled:opacity-40 active:scale-95"><Minus className="w-4 h-4 text-stone-600 dark:text-stone-400" /></button>
                  <input type="number" value={itemForm.quantity} onChange={e => setItemForm(p => ({ ...p, quantity: Math.max(selectedProduct.min_quantity || 1, Math.min(selectedProduct.max_quantity || 99999, parseInt(e.target.value) || 1)) }))} className="w-24 text-center px-3 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold outline-none focus:ring-4 focus:ring-[#c2410c]/10" />
                  <button type="button" onClick={() => setItemForm(p => ({ ...p, quantity: Math.min(selectedProduct.max_quantity || 99999, p.quantity + 1) }))} disabled={itemForm.quantity >= (selectedProduct.max_quantity || 99999)} className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 disabled:opacity-40 active:scale-95"><Plus className="w-4 h-4 text-stone-600 dark:text-stone-400" /></button>
                  <div className="flex gap-1.5">
                    {[10, 50, 100, 500].map(q => (
                      <button key={q} type="button" onClick={() => setItemForm(p => ({ ...p, quantity: Math.min(selectedProduct.max_quantity || 99999, q) }))} className="px-2.5 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg hover:bg-[#fff7ed] hover:text-[#c2410c] font-semibold">{q}</button>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-stone-500">Subtotal: <span className="font-bold text-stone-900 dark:text-stone-100 ml-1 tabular-nums">KES {(selectedProduct.price * itemForm.quantity).toLocaleString()}</span></p>
              </div>
              {selectedProduct.fields?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">Specifications</h4>
                  <div className="space-y-4">
                    {selectedProduct.fields.map(field => (
                      <div key={field.id}>
                        <label className="block text-sm text-stone-600 dark:text-stone-400 mb-1.5 font-medium">{field.name}{field.required && <span className="text-[#c2410c] ml-1">*</span>}</label>
                        <FieldInput field={field} value={itemForm.fieldValues[field.id]} onChange={v => setItemForm(p => ({ ...p, fieldValues: { ...p.fieldValues, [field.id]: v } }))} />
                        {field.help_text && field.field_type !== "checkbox" && <p className="text-xs text-stone-400 mt-1.5">{field.help_text}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">Notes / Special Instructions</label>
                <textarea value={itemForm.notes} onChange={e => setItemForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..." rows={3} className={inputCls} />
              </div>
              {selectedProduct.requires_design && (
                <div className="p-3.5 bg-[#fff7ed] dark:bg-[#c2410c]/5 border border-[#c2410c]/15 rounded-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#c2410c]/10 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-[#c2410c]" /></div>
                  <p className="text-sm text-[#c2410c] font-medium"><strong>Design Required:</strong> Provide details during checkout.</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {btnCancel(() => setShowAddModal(false))}
                <button type="button" onClick={handleAddToCart} className="flex-1 px-4 py-3 bg-[#1c1917] dark:bg-white hover:bg-[#c2410c] dark:hover:bg-[#c2410c] dark:hover:text-white text-white dark:text-stone-900 rounded-xl font-bold shadow-lg active:scale-[0.98] text-sm flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Select Design
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-anim">
          <div className="absolute inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-md" onClick={closeProductModal} />
          <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/60 dark:border-stone-700 w-full max-w-md max-h-[90vh] overflow-y-auto modal-anim">
            {modalHeader(editingProduct ? <Edit3 className="w-[18px] h-[18px] text-white" /> : <Plus className="w-[18px] h-[18px] text-white" />, editingProduct ? "Edit Product" : "Add Product", editingProduct ? "Update product details" : "Create a new product", closeProductModal)}
            <form onSubmit={handleProductSubmit} className="p-6 space-y-5" encType="multipart/form-data">
              {(editingProduct?.image || productForm.image) && (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                  <ProductImage src={productForm.image instanceof File ? URL.createObjectURL(productForm.image) : editingProduct?.image} alt="Preview" className="!h-40" />
                </div>
              )}
              <div><label className={labelCls}>Product Name</label><input type="text" placeholder="e.g. Business Cards" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Category</label>
                <div className="flex gap-2">
                  <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className={`flex-1 ${inputCls} appearance-none`}>
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", description: "" }); setShowCategoryModal(true); }} className="w-11 h-11 flex items-center justify-center bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 active:scale-95 text-lg font-medium" title="Quick add category">+</button>
                </div>
              </div>
              <div><label className={labelCls}>Price (KES)</label><input type="number" step="0.01" placeholder="0.00" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className={`${inputCls} tabular-nums`} /></div>
              <div><label className={labelCls}>Description</label><textarea placeholder="Describe the product..." value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className={`${inputCls} resize-none`} rows={3} /></div>
              <div><label className={labelCls}>Product Image</label><input type="file" accept="image/*" onChange={e => e.target.files[0] && setProductForm({ ...productForm, image: e.target.files[0] })} className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#fff7ed] file:text-[#c2410c] cursor-pointer" /></div>
              <div className="flex gap-3 pt-2">{btnCancel(closeProductModal)}{btnPrimary(editingProduct ? "Update Product" : "Create Product", productSaving)}</div>
            </form>
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overlay-anim">
          <div className="absolute inset-0 bg-[#1c1917]/60 dark:bg-black/60 backdrop-blur-md" onClick={closeCategoryModal} />
          <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200/60 dark:border-stone-700 w-full max-w-md modal-anim">
            {modalHeader(<LayoutGrid className="w-[18px] h-[18px] text-white" />, editingCategory ? "Edit Category" : "Add Category", editingCategory ? "Update category details" : "Organize your products", closeCategoryModal)}
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-5">
              <div><label className={labelCls}>Category Name</label><input type="text" placeholder="e.g. Business Cards" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Description <span className="text-stone-400 font-normal normal-case">optional</span></label><textarea placeholder="Brief description..." value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className={`${inputCls} resize-none`} rows={2} /></div>
              <div className="flex gap-3 pt-2">{btnCancel(closeCategoryModal)}{btnPrimary(editingCategory ? "Update Category" : "Create Category", categorySaving)}</div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {deletingProduct && (
        <DeleteModal
          title="Delete Product"
          message={<>Are you sure you want to delete <strong className="text-stone-700 dark:text-stone-300">{deletingProduct.name}</strong>?</>}
          onConfirm={confirmDeleteProduct}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
      {deletingCategory && (
        <DeleteModal
          zIndex="z-[60]"
          title="Delete Category"
          message={<>Delete <strong className="text-stone-700 dark:text-stone-300">{deletingCategory.name}</strong>? Products in this category won't be deleted.</>}
          onConfirm={confirmDeleteCategory}
          onCancel={() => setDeletingCategory(null)}
        />
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .overlay-anim { animation: fadeUp 0.25s ease forwards; }
        .modal-anim { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
    </div>
  );
};

export default ProductsList;