import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  createCategory
} from "@/store/slices/productsSlice";
import toast from "react-hot-toast";
import { Package, Plus, FolderPlus, Folder, Edit, Trash2 } from "lucide-react";

const ProductsList = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: null,
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const isAdmin = user?.role === "admin" || user?.role === "platform_admin";
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Product create/update
const handleSubmitProduct = async (e) => {
  e.preventDefault();
  if (!productForm.name.trim()) return toast.error("Product name is required");
  if (!productForm.price) return toast.error("Price is required");
  let payload;
  let config = {}; 
  if (productForm.image) {
    payload = new FormData();
    payload.append("name", productForm.name);
    payload.append("price", parseFloat(productForm.price));
    payload.append("category", productForm.category || "");
    payload.append("description", productForm.description || "");
    payload.append("image", productForm.image);

  } else {
  
    payload = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      category: productForm.category || null,
      description: productForm.description || "",
    };
    config.headers = { "Content-Type": "application/json" }; 
  }

  try {
    let result;
    if (editingProduct) {
      // Update product
      result = await dispatch(updateProduct({ id: editingProduct.id, data: payload, config }));
      if (updateProduct.fulfilled.match(result)) {
        toast.success("Product updated");
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: "", category: "", price: "", description: "", image: null });
        dispatch(fetchProducts());
      } else {
        toast.error(result.payload || "Failed to update product");
      }
    } else {
      // Create product
      result = await dispatch(createProduct({ data: payload, config }));
      if (createProduct.fulfilled.match(result)) {
        toast.success("Product created");
        setShowProductModal(false);
        setProductForm({ name: "", category: "", price: "", description: "", image: null });
        dispatch(fetchProducts());
      } else {
        toast.error(result.payload || "Failed to create product");
      }
    }
  } catch (err) {
    toast.error("Something went wrong");
    console.error(err);
  }
};

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) toast.success("Product deleted");
  };

  // Category create
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return toast.error("Category name is required");

    const result = await dispatch(createCategory({ name: categoryForm.name, description: categoryForm.description || "" }));
    if (createCategory.fulfilled.match(result)) {
      toast.success("Category created");
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "" });
      dispatch(fetchCategories());
    } else {
      toast.error(result.payload || "Failed to create category");
    }
  };

  // Open modal for editing product
  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category || "",
      price: product.price,
      description: product.description || "",
      image: null,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage products and categories</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FolderPlus className="w-4 h-4" /> Category
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Product
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Folder className="w-5 h-5 text-orange-500" /> Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories?.length === 0 ? (
            <p className="text-gray-500 text-sm">No categories yet</p>
          ) : (
            categories.map((cat) => (
              <span key={cat.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{cat.name}</span>
            ))
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : products?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No products yet</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category_name || "No category"}</p>
                </div>
                <p className="font-bold text-orange-600">KES {(product.price || 0).toLocaleString()}</p>
              </div>
              {product.description && <p className="text-sm text-gray-500 mt-2">{product.description}</p>}
              {isAdmin && (
                <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                  <button onClick={() => openEditModal(product)} className="text-gray-500 hover:text-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Product Modal (Create/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmitProduct} className="space-y-4" encType="multipart/form-data">
              <input type="text" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <div className="flex gap-2">
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg">
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowCategoryModal(true)} className="px-2 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
              </div>
              <input type="number" step="0.01" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows="2" />
              <input type="file" accept="image/*" onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })} className="w-full" />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: null }); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg">{editingProduct ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Add Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input type="text" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows="2" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2 border rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
