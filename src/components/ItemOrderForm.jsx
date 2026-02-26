import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createItemOrder } from "@/slices/itemSlice";

const ItemOrderForm = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    product_type: "",
    title: "",
    description: "",
    quantity: "",
    size: "",
    width: "",
    height: "",
    material: "",
    cover_type: "",
    lamination: "",
    binding: "",
    color: "",
    pen_type: "",
    design_file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "design_file") {
      setFormData({ ...formData, design_file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    for (let key in formData) {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    }

    dispatch(createItemOrder(data));
  };

  return (
    <form onSubmit={handleSubmit}>
      <select name="product_type" onChange={handleChange} required>
        <option value="">Select Product</option>
        <option value="card">Card</option>
        <option value="banner">Banner</option>
        <option value="book">Book</option>
        <option value="flyer">Flyer</option>
        <option value="clothes">Clothes</option>
        <option value="pen">Pen</option>
        <option value="envelope">Envelope</option>
      </select>

      <input name="title" placeholder="Title" onChange={handleChange} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} required />
      <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} required />

      {/* CARD */}
      {formData.product_type === "card" && (
        <input name="size" placeholder="Size" onChange={handleChange} />
      )}

      {/* BANNER */}
      {formData.product_type === "banner" && (
        <>
          <input name="width" placeholder="Width" onChange={handleChange} />
          <input name="height" placeholder="Height" onChange={handleChange} />
          <input name="material" placeholder="Material" onChange={handleChange} />
        </>
      )}

      {/* BOOK */}
      {formData.product_type === "book" && (
        <>
          <input name="cover_type" placeholder="Cover Type" onChange={handleChange} />
          <input name="lamination" placeholder="Lamination" onChange={handleChange} />
          <input name="binding" placeholder="Binding" onChange={handleChange} />
        </>
      )}

      <input type="file" name="design_file" onChange={handleChange} />

      <button type="submit">Submit Order</button>
    </form>
  );
};

export default ItemOrderForm;