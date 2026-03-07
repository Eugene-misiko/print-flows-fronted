import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { initiatePayment } from "@/slices/paymentSlice";

const PaymentPage = () => {

  const { id } = useParams();
  const dispatch = useDispatch();

  const { loading, success, error } = useSelector(
    (state) => state.payment
  );

  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      initiatePayment({
        invoice_id: id,
        phone_number: phone
      })
    );
  };

  return (
    <div>

      <h2>Pay Invoice #{id}</h2>

      <form onSubmit={handleSubmit}>

        <div>

          <label>Phone Number</label>

          <input
            type="text"
            placeholder="2547XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Pay with M-Pesa"}
        </button>

      </form>

      {success && <p>Payment request sent to your phone.</p>}

      {error && <p>{error}</p>}

    </div>
  );
};

export default PaymentPage;