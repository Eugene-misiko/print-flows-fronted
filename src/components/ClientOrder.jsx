import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "@/slices/orderSlice";
import { fetchProducts } from "@/slices/productSlice";

const ClientOrder = () => {
  const dispatch = useDispatch();

  const { products, loading } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    product: "",
    quantity: 1,
    needs_design: false,
    design_file: null,
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("product", formData.product);
    data.append("quantity", formData.quantity);
    data.append("needs_design", formData.needs_design);
    data.append("notes", formData.notes);

    if (formData.design_file) {
      data.append("design_file", formData.design_file);
    }

    dispatch(createOrder(data));
  };

  return (
    <div>
      <h2>Create Order</h2>

      {loading && <p>Loading products...</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Product:</label>
          <select
            name="product"
            value={formData.product}
            onChange={handleChange}
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="needs_design"
              checked={formData.needs_design}
              onChange={handleChange}
            />
            Request Design
          </label>
        </div>

        {!formData.needs_design && (
          <div>
            <label>Upload Design:</label>
            <input
              type="file"
              name="design_file"
              onChange={handleChange}
            />
          </div>
        )}

        <div>
          <label>Notes:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
};

export default ClientOrder;