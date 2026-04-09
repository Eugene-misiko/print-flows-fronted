import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProducts, fetchPublicCategories } from "@/store/slices/productsSlice";
import { Link } from "react-router-dom";

const StoreHome = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchPublicProducts());
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-8">

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="flex gap-4 flex-wrap">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.id}`}>
              <div className="px-4 py-2 bg-gray-200 rounded">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-xl font-bold mb-4">Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <Link key={p.id} to={`/product/${p.id}`}>
              <div className="border p-3 rounded">
                <img src={p.image} alt="" className="h-40 w-full object-cover" />
                <h3>{p.name}</h3>
                <p>{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default StoreHome;