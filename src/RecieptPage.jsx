import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();

const state = location.state || {};

const {
  service,
  data,
  TotalPrice,
  paymentStatus,
  paymentMethod,
  invoiceNo = "N/A"
} = state;





const discountAmount = Number(state.discount ?? 0);
  

  const generatePDF = (action = "download") => {
    if (!data?.cars?.length) {
      alert("No invoice data found");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(15);
    doc.text("Al Khat auto polishing & Accessories Fix", 14, 18);
    doc.setFontSize(11);
    doc.text("Phone: +971 503055671", 14, 32);
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoiceNo}`, 150, 18);
    doc.text(`Date: ${new Date().toLocaleString()}`, 150, 24);

  
    doc.setFontSize(12);
    doc.text("Customer Details", 14, 45);
    doc.setFontSize(10);
    doc.text(`Name: ${data.name}`, 14, 52);
    doc.text(`Phone: ${data.phone}`, 14, 58);

    doc.autoTable({
      startY: 70,
      head: [["Car Name", "Car Number"]],
      body: data.cars.map((car) => [car.carName, car.carNumber]),
      styles: { fontSize: 10 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text(`Service: ${service}`, 14, finalY);
    doc.text(`Quantity: ${data.quantity}`, 14, finalY + 6);
    doc.text(`Payment Method: ${paymentMethod}`, 14, finalY + 12);


  




    doc.setFontSize(12);
    doc.setTextColor("#28a745");
    
    if (discountAmount>0){
     doc.text(`Discount Amount: AED${discountAmount}`, 14, finalY + 22);
     }

    doc.text(`Total Amount: AED${TotalPrice}`, 14, finalY + 30);
  
    doc.setFontSize(11);
    doc.setTextColor(paymentStatus === "paid" ? "#28a745" : "#f39c12");
    doc.text(
      `Payment Status: ${paymentStatus === "paid" ? "Paid" : "Pending"}`,
      14,
      finalY + 38
    );

    doc.setFontSize(9);
    doc.setTextColor("#666");
    doc.text(
      "Thank you for choosing Al Khat auto polishing & Accessories Fix.",
      14,
      285
    );

    if (action === "print") {
      window.open(doc.output("bloburl")).print();
    } else {
      doc.save(`Invoice_${invoiceNo}.pdf`);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "60px auto", textAlign: "center" }}>
      <h2>🧾 Payment Receipt</h2>
      <p>
        Payment <strong>{paymentMethod}</strong> —{" "}
        {paymentStatus === "paid" ? "Successful" : "Pending"}
      </p>

      <button onClick={() => generatePDF("download")} style={btnGreen}>
        Download Invoice
      </button>

      <button onClick={() => generatePDF("print")} style={btnGray}>
        🖨️ Print Invoice
      </button>

      <br />

      <button onClick={() => navigate("/", { replace: true})} style={linkBtn}>
        Back to Home
      </button>
    </div>
  );
}



const btnGreen = {
  padding: "12px 25px",
  fontSize: "16px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  marginTop: "20px",
  cursor: "pointer"
};

const btnGray = {
  ...btnGreen,
  backgroundColor: "#6c757d",
  marginLeft: "20px"
};

const linkBtn = {
  marginTop: "20px",
  background: "transparent",
  border: "none",
  color: "#007bff",
  cursor: "pointer"
};