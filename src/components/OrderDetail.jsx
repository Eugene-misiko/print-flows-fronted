import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderById,
  designComplete,
  designReject,
  printApprove,
  printReject,
  startPrinting,
  completePrint,
} from "@/slices/orderSlice";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { order, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (loading || !order) {
    return <p className="text-center mt-20">Loading order...</p>;
  }
  return(
    <>

    </>
  )
}