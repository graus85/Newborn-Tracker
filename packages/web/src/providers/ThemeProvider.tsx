import React from "react";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Espandi qui logica per gestire il tema/chiarezza/scuro/ecc.
  // Base: restituisce solo i figli.
  return <>{children}</>;
};

export default ThemeProvider;
