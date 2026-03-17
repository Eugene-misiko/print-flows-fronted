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
</>
  );
};

export default EditProduct;