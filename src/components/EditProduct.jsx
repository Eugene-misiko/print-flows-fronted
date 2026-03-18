import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });

  // Fetch product + categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get(`/api/products/${id}/`),
          api.get("/api/categories/"),
        ]);

        const product = productRes.data;

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category?.id || product.category,
          image: null, // do not prefill file
        });

        setCategories(categoryRes.data);

      } catch (err) {
        console.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await api.patch(`/api/products/${id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/products/${id}`);

    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
<>
    <div className="max-w-3xl mx-auto space-y-8 ">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Edit Product
        </h1>
        <p className="text-gray-500">
          Update product information
        </p>
      </div>
      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm mb-2">
              Product Name
            </label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {/* Price */}
          <div>
            <label className="block text-sm mb-2">
              Price
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          {/* Image */}
          <div>
            <label className="block text-sm mb-2">
              New Image (optional)
            </label>
            <input
              type="file"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  image: e.target.files[0],
                })
              }
            />
          </div>
          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
            Update Product
          </button>
        </form>
      </div>
    </div>
</>
  );
};

export default EditProduct;