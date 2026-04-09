import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProduct } from "@/store/slices/productsSlice";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchPublicProduct(id));
  }, [dispatch, id]);

  if (isLoading) return <p>Loading...</p>;
  if (!currentProduct) return <p>Not found</p>;

  return (
    <div className="p-6">
      <img src={currentProduct.image} className="w-full h-80 object-cover" />
      <h1 className="text-2xl font-bold mt-4">{currentProduct.name}</h1>
      <p>{currentProduct.description}</p>
      <p className="text-lg font-semibold">{currentProduct.price}</p>

      <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded">
        Select Design Now
      </button>
    </div>
  );
};

export default ProductDetail;