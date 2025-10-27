import React from "react";
import SearchForm from "./components/javascript/SearchForm";

function App() {
  const handleSearchSubmit = (selected) => {
    if (selected) {
      console.log("🔎 Користувач вибрав:", selected);
      // Тут пізніше викликатимемо startSearchPrices(selected.id)
    }
  };

  return (
    <div style={{ display: "flex", gap: "30px", justifyContent: "center", marginTop: "50px" }}>
      <SearchForm onSubmit={handleSearchSubmit}/>
    </div>
  );
}

export default App;
