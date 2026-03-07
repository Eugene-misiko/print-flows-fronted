import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoice, downloadInvoice } from "@/slices/invoiceSlice";

const InvoicePage = () => {

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { invoice, loading, error } = useSelector(
    (state) => state.invoice
  );

  useEffect(() => {
    dispatch(fetchInvoice(id));
  }, [dispatch, id]);

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <p>{error}</p>;
  if (!invoice) return <p>No invoice found</p>;

  const deposit = invoice.total_amount * 0.7;
  const balance = invoice.total_amount * 0.3;

  return (
    <div>

      <h2>Invoice #{invoice.id}</h2>

      <p>Product: {invoice.product_name}</p>
      <p>Quantity: {invoice.quantity}</p>
      <p>Unit Price: {invoice.unit_price}</p>

      <hr />

      <p>Total Amount: {invoice.total_amount}</p>
      <p>Deposit Required (70%): {deposit}</p>
      <p>Remaining Balance (30%): {balance}</p>

      <button onClick={() => navigate(`/payment/${invoice.id}`)}>
        Pay Deposit
      </button>

      <button onClick={() => dispatch(downloadInvoice(invoice.id))}>
        Download Invoice
      </button>

    </div>
  );
};

export default InvoicePage;