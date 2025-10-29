import React from "react";
import SearchForm from "./components/javascript/SearchForm";
import ToursList from "./components/javascript/ToursList";

function App() {
  const handleSearchSubmit = (selected) => {
    if (selected) {
      // console.log("Користувач вибрав:", selected);
    }
  };

  return (
    <div>
      <SearchForm onSubmit={handleSearchSubmit}/>
    </div>
  );
}

export default App;
