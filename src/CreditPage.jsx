import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { service, data, TotalPrice } = location.state || {};
const generatePDF = (action = "download") => {
  if (!data?.cars?.length) {
    alert("No invoice data found");
    return;
  }

  const doc = new jsPDF();

  /* ================= HEADER ================= */
  doc.setFontSize(15);
  doc.setTextColor("#1f2937");
  doc.text("Al Khat auto polishing & Accessories Fix", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor("#555");
  doc.text("Phone: +971 503055671", 14, 32);

  doc.setFontSize(10);
  doc.text(`Invoice No: CW-${Date.now()}`, 150, 18);
  doc.text(`Date: ${new Date().toLocaleString()}`, 150, 24);

  /* ================= CUSTOMER ================= */
  doc.setFontSize(12);
  doc.setTextColor("#111");
  doc.text("Customer Details", 14, 45);

  doc.setFontSize(10);
  doc.text(`Name: ${data.name}`, 14, 52);
  doc.text(`Phone: ${data.phone}`, 14, 58);

  /* ================= TABLE ================= */
  doc.autoTable({
    startY: 70,
    head: [["Car Name", "Car Number"]],
    body: data.cars.map(car => [car.carName, car.carNumber]),
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [40, 167, 69], textColor: 255 },
  });

  /* ================= SERVICE ================= */
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.text(`Service: ${service}`, 14, finalY);
  doc.text(`Quantity: ${data.quantity}`, 14, finalY + 6);

  doc.setFontSize(12);
  doc.setTextColor("#28a745");
  doc.text(`Total Amount: AED ${TotalPrice}`, 14, finalY + 18);

  /* ================= FOOTER ================= */
  doc.setFontSize(9);
  doc.setTextColor("#666");
  doc.text(
    "Thank you for choosing Al Khat auto polishing & Accessories Fix. Visit again!",
    14,
    285
  );

  if (action === "print") {
    const pdfBlob = doc.output("bloburl");
    const printWindow = window.open(pdfBlob);
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    doc.save("Car_Wash_Invoice.pdf");
  }
};

  return (
    <div style={{ maxWidth: "500px", margin: "60px auto", textAlign: "center" }}>
      <h2>🧾 Payment Receipt</h2>
      <p>Your payment was successful.</p>

      <button
        onClick={generatePDF}
        style={{
          padding: "12px 25px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Download Invoice PDF
      </button>
<button
  onClick={() => generatePDF("print")}
  style={{
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "#939ba8ff",
    color: "#ede8e8ff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "15px",
    marginLeft:"25px"
  }}
>
  🖨️ Print Invoice
</button>

      <br />

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          background: "transparent",
          border: "none",
          color: "#007bff",
          cursor: "pointer",
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
