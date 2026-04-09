import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicCategory } from "@/store/slices/productsSlice";
import { useParams, Link } from "react-router-dom";

const CategoryPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCategory, isLoading } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchPublicCategory(id));
  }, [dispatch, id]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{currentCategory?.name}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {currentCategory?.products?.map(p => (
          <Link key={p.id} to={`/product/${p.id}`}>
            <div className="border p-3 rounded">
              <img src={p.image} className="h-40 w-full object-cover" />
              <h3>{p.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;