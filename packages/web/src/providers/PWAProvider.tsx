import React from "react";

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Qui puoi aggiungere logica PWA; per ora è uno stub che non blocca la build
  return <>{children}</>;
};

export default PWAProvider;
