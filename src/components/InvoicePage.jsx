import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoice, downloadInvoice } from "@/slices/invoiceSlice";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";

const InvoicePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

const { invoice, loading, error } = useSelector(
  (state) => state.invoices
);

  useEffect(() => {
    dispatch(fetchInvoice(id));
  }, [dispatch, id]);

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading invoice...
      </p>
    );

  if (error)
    return (
      <p className="text-center mt-20 text-red-500">
        {error}
      </p>
    );

  if (!invoice)
    return (
      <p className="text-center mt-20">
        No invoice found
      </p>
    );

  const subtotal = invoice.total_amount;
  const vat = (subtotal * 0.16).toFixed(2);
  const total = (subtotal + Number(vat)).toFixed(2);
  const deposit = (total * 0.7).toFixed(2);

  return (
    <>
    <Navbar/>
    <Sidebar/>
    <div className="min-h-screen dark:bg-zinc-900 bg-gray-100 flex justify-center py-10">

    
      <div className="bg-white w-[900px] shadow-xl p-10 dark:bg-gray-900/60 rounded-lg">

        {/* Header */}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">

            <img src="/media/logo.png" className="w-16" />

            <div>
              <h1 className="text-2xl font-bold text-blue-700 tracking-wider">
                ZENITH ZEST LIMITED
              </h1>

              <p className="text-xs text-orange-600">
                P.O Box 102337-00400, Nairobi Kenya
              </p>

              <p className="text-xs text-orange-600">
                Tel: 0707 458 198, 0700 300 051
              </p>
            </div>
          </div>

          <div className="text-right text-sm">
            <p>Email: info@zenithzest.com</p>
            <p>Website: www.zenithzest.com</p>
          </div>
        </div>

        {/* Top lines */}

        <div className="border-b-4 border-blue-600 mt-4"></div>
        <div className="border-b-4 border-orange-500"></div>
        {/* Invoice title */}
        <div className="flex justify-end mt-6">
          <div className="text-right">
            <h2 className="text-2xl font-semibold">
              INVOICE
            </h2>

            <p className="text-sm">
              Invoice No. {invoice.id}
            </p>

            <p className="text-sm">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Client */}

        <div className="mt-6 text-sm">
          <p className="font-semibold">
            TO: AM SOLUTIONS
          </p>
        </div>

        {/* Table */}

        <table className="w-full mt-4 border text-sm ">
          <thead className="bg-gray-100 ">
            <tr className="dark:bg-gray-700">
              <th className="border p-2 text-left ">
                Description
              </th>
              <th className="border p-2">
                Quantity
              </th>
              <th className="border p-2">
                Price (Ksh)
              </th>
              <th className="border p-2">
                Amount (Ksh)
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border p-2">
                {invoice.product_name}
              </td>

              <td className="border p-2 text-center">
                {invoice.quantity}
              </td>

              <td className="border p-2 text-center">
                {invoice.unit_price}
              </td>

              <td className="border p-2 text-center">
                {invoice.total_amount}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}

        <div className="flex justify-end mt-6">
          <table className="w-60 text-sm border">
            <tbody>
              <tr>
                <td className="border p-2">
                  Sub-Total
                </td>

                <td className="border p-2 text-right">
                  {subtotal}
                </td>
              </tr>

              <tr>
                <td className="border p-2">
                  VAT
                </td>

                <td className="border p-2 text-right">
                  {vat}
                </td>
              </tr>

              <tr className="font-bold">
                <td className="border p-2">
                  Total
                </td>

                <td className="border p-2 text-right">
                  {total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment details */}

        <div className="mt-10 text-sm">
          <h3 className="font-semibold mb-2">
            Payment Details
          </h3>

          <p>COOPERATIVE BANK - MOI AVENUE BRANCH</p>
          <p>ZENITH ZEST LIMITED</p>
          <p>ACCOUNT NO. 011942386580</p>
          <p>PIN: P050316362U</p>
          <p>TEL: 0707 458198</p>
          <p>P.O BOX 102337-00400</p>
          <p>NAIROBI, KENYA</p>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-4 mt-10">

          <button
            onClick={() => navigate(`/payment/${invoice.id}`)}
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
          >
            Pay Deposit (70%)
          </button>

          <button
            onClick={() => dispatch(downloadInvoice(invoice.id))}
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-black"
          >
            Download Invoice
          </button>
        </div>
        {/* Footer */}
        <div className="mt-12 dark:text-white border-t-4 border-orange-500 pt-4 text-sm flex justify-center gap-6 text-gray-700">
          <span>Printing</span>
          <span>Branding</span>
          <span>Stationery</span>
          <span>Office Equipments</span>
          <span>Customized Notebooks</span>
        </div>

      </div>
    </div>
    </>
  );
};

export default InvoicePage;