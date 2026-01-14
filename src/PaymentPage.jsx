
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DiscountInput from "./DiscountInput.jsx";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, data, price } = location.state;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [discount, setDiscount] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiLock = useRef(false); // lock to prevent double API call
  const paymentOptions = ["Card", "Cash", "Banking", "Credit"];
  const originalTotal = price * data.quantity;
  const discountedTotal = Math.max(originalTotal - discount, 0);

  // ======================
  // CREATE ORDER (SAFE SINGLE CALL)
  // ======================
 const createOrder = async (method, status) => {
  if (apiLock.current) return;
  apiLock.current = true;

  const appliedDiscount = Number(discount)  // ✅ LOCK VALUE

  try {
    setPaymentMethod(method);
    setPaymentStatus(status);
    setSuccessMessage(
      status === "paid"
        ? "Payment completed successfully"
        : "Payment added as credit (Pending)"
    );

    const payload = {
      service,
      data,
      TotalPrice: Math.max(originalTotal - appliedDiscount, 0),
      paymentMethod: method,
      paymentStatus: status,
    };

    const response = await fetch("https://alkhat-carwash.onrender.com/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Order creation failed");

    const savedOrder = await response.json();
    const invoiceNo = savedOrder?.data?.invoiceNo;

    if (!invoiceNo) {
      alert("Invoice number not returned from API");
      return;
    }

    setTimeout(() => {
      setSuccessMessage("");
      navigate("/billing", {
        replace: true,
        state: {
          service,
          data,
          TotalPrice: Math.max(originalTotal - appliedDiscount, 0),
          paymentMethod: method,
          paymentStatus: status,
          invoiceNo,
          ...(appliedDiscount > 0 && { discount: appliedDiscount } ), // ✅ SAFE
        },
      });
    }, 2000);
  } catch (error) {
    console.error(error);
    setPaymentStatus("failed");
    setSuccessMessage("Payment failed");
  } finally {
    setLoading(false);
    apiLock.current = false;
  }
};


  // ======================
  // HANDLE PAYMENT
  // ======================
  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Select a payment method");
      return;
    }
    setLoading(true);

    if (paymentMethod === "Credit") {
      createOrder("Credit", "pending");
    } else {
      createOrder(paymentMethod, "paid");
    }
  };

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "60px auto",
        padding: "28px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "25px" }}>💳 Payment</h2>


      <div
        style={{
          background: "#f8f9fa",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "25px",
          border: "1px solid #e3e3e3",
        }}
      >
        <h3>🧾 Summary</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#28a745", color: "#fff" }}>
              <th style={{ padding: "14px", textAlign: "left" }}>Car Name</th>
              <th style={{ padding: "14px", textAlign: "left" }}>Car Number</th>
            </tr>
          </thead>
          <tbody>
            {data.cars.map((car, idx) => (
              <tr key={idx}>
                <td style={{ padding: "12px" }}>{car.carName}</td>
                <td style={{ padding: "12px" }}>{car.carNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          <strong>Quantity:</strong> {data.quantity}
        </p>
        <p>
          <strong>Service:</strong> {service}
        </p>
        <p>
          <strong>Payment Method:</strong> {paymentMethod || "-"}
        </p>
        <p>
          <strong>Payment Status:</strong>{" "}
          <span
            style={{
              color:
                paymentStatus === "paid"
                  ? "green"
                  : paymentStatus === "pending"
                  ? "orange"
                  : paymentStatus === "failed"
                  ? "red"
                  : "#000",
              fontWeight: "600",
            }}
          >
            {paymentStatus || "-"}
          </span>
        </p>

        <div
          style={{
            marginTop: "15px",
            paddingTop: "12px",
            borderTop: "1px dashed #ccc",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#28a745",
          }}
        >
          <span>Total</span>
          <div style={{ textAlign: "right" }}>
            {discount > 0 && (
              <div style={{ fontSize: "14px", color: "#dc3545" }}>
                Discount: -AED {discount}
              </div>
            )}
            <div>AED {discountedTotal}</div>
          </div>
        </div>
      </div>

   


      <DiscountInput onDiscountApplied={(val)=>setDiscount(val)}/>
    
      
      <h3>Select Payment Method</h3>
      <div style={{ display: "flex", gap: "12px" }}>
        {paymentOptions.map((option) => (
          <div
            key={option}
            onClick={() => setPaymentMethod(option)}
            style={{
              flex: 1,
              padding: "18px",
              textAlign: "center",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              backgroundColor: paymentMethod === option ? "#e6f4ea" : "#fff",
              border:
                paymentMethod === option
                  ? "2px solid #28a745"
                  : "1px solid #ccc",
            }}
          >
            {option}
          </div>
        ))}
      </div>

    
      <button
        onClick={handlePayment}
        disabled={loading || paymentStatus}
        style={{
          marginTop: "30px",
          width: "100%",
          padding: "16px",
          fontSize: "17px",
          fontWeight: "bold",
          color: "#fff",
          background: paymentStatus
            ? "#6c757d"
            : "linear-gradient(135deg, #28a745, #218838)",
          border: "none",
          borderRadius: "14px",
        }}
      >
        {loading ? "⏳ Processing..." : paymentStatus === "paid" ? "Payment Done" : paymentStatus === "pending" ? "Credit Added" : "Pay Now"}
      </button>


      {successMessage && (
        <div
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor:
              paymentStatus === "pending"
                ? "#ffc107"
                : paymentStatus === "paid"
                ? "#28a745"
                : paymentStatus === "failed"
                ? "#dc3545"
                : "#28a745",
            color: "#fff",
            padding: "20px 32px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "600",
            zIndex: 9999,
            textAlign: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          }}
        >
          {paymentStatus === "pending"
            ? "⏳ "
            : paymentStatus === "paid"
            ? "✅ "
            : paymentStatus === "failed"
            ? "❌ "
            : "ℹ️ "}
          {successMessage}
        </div>
      )}
    </div>
  );
}
