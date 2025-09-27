import React from "react";

const BottomNavigation: React.FC = () => {
  return (
    <nav className="bottom-navigation">
      {/* Qui puoi aggiungere i link alle pagine principali */}
      <button>Log</button>
      <button>Summary</button>
      <button>More</button>
    </nav>
  );
};

export default BottomNavigation;
