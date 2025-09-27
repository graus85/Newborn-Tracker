import React from "react";

const FloatingActionButton: React.FC = () => {
  return (
    <button
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#218085",
        color: "#fff",
        fontSize: "2rem",
        border: "none",
        boxShadow: "0 4px 16px #0002",
        cursor: "pointer"
      }}
    >
      +
    </button>
  );
};

export default FloatingActionButton;
