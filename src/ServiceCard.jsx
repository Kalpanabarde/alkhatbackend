import React from "react";


export default function ServiceCard({
  label,
  icon,
  price,
  selected,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "100%",
        height: "190px",
        borderRadius: "16px",
        backgroundColor: "#fff",
        border: selected ? "2px solid #28a745" : "1px solid #e0e0e0",
        boxShadow: selected
          ? "0 8px 20px rgba(40,167,69,0.25)"
          : "0 4px 10px rgba(0,0,0,0.06)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
    >
      {/* ✅ REAL ICON */}
      <img
        src={icon}
        alt={label}
        style={{
          width: "64px",
          height: "64px",
          objectFit: "contain",
          marginBottom: "12px",
        }}
      />

      <div style={{ fontWeight: "600", textAlign: "center" }}>
        {label}
      </div>

      {price !== "" && (
        <div style={{ marginTop: "6px", color: "#28a745", fontWeight:'bold' }}>
          Price: AED{price}
        </div>
      )}
    </div>
  );
}

