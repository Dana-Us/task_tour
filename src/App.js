import React from "react";
import SearchForm from "./components/javascript/SearchForm";
import TourPage from "./components/javascript/TourPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchForm />} />
        <Route path="/tour/:hotelId/:priceId" element={<TourPage />} />
      </Routes>
    </Router>
  );
}

export default App;
