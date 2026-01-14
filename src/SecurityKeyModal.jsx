import React, { useState } from "react";

export default function SecurityKeyModal({ open, onClose, onVerify }) {
  const [key, setKey] = useState("");

  const handleVerify = () => {
    onVerify(key);
    setKey(""); // reset input
  };

  if (!open) return null;

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "10px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#fff",
          padding: "28px 20px",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔐</div>
        <h2 style={{ marginBottom: "8px" }}>Staff Verification</h2>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
          Enter your security key to apply the discount
        </p>

        <input
          type="password"
          placeholder="Security Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "20px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleVerify}
            style={{
              flex: 1,
              minWidth: "120px",
              background: "#28a745",
              color: "#fff",
              padding: "12px 0",
              borderRadius: "10px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
              transition: "0.2s",
            }}
          >
            Verify
          </button>

          <button
            onClick={() => {
              onClose();
              setKey("");
            }}
            style={{
              flex: 1,
              minWidth: "120px",
              background: "#dc3545",
              color: "#fff",
              padding: "12px 0",
              borderRadius: "10px",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
              transition: "0.2s",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
  