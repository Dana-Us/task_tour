import React from "react";
import { useGeoSearch } from "../javascript/useGeoSearch";
import { useSearchTours } from "../javascript/useSearchTours"; 
import "../style/SearchForm.css";

export default function SearchForm() {
  const {
    query,
    setQuery,
    options,
    isOpen,
    wrapperRef,
    handleFocus,
    handleChange,
    handleSelect,
    handleSearch,
    handleKeyDown,
    selected,
  } = useGeoSearch();

  const { searchTours, tours, status, error } = useSearchTours();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selected?.type === "country") { 
      searchTours(selected.id);
    } else {
      handleSearch();
    }
  };

  return (
    <div className="search-card" ref={wrapperRef}>
      <h2>Форма пошуку турів</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Введіть країну, місто або готель..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown} 
          />
        </div>

        {isOpen && (
          <ul className="dropdown">
            {options.length > 0 ? (
              options.map((item) => (
                <li key={item.id} onClick={() => handleSelect(item)}>
                  <img src={item.icon} alt={item.type} className="icon" />
                  <span>{item.name}</span>
                </li>
              ))
            ) : (
              <li className="no-results">Нічого не знайдено</li>
            )}
          </ul>
        )}

      {status === "loading" && <img class="loader_gif" src="/img/loading.gif" alt="Loading..." />}
      {status === "error" && (
        <p className="error">Помилка: {error || "Не вдалося знайти тури"}</p>
      )}
      {status === "empty" && (
        <p className="empty">За вашим запитом турів не знайдено</p>
      )}
        <button type="submit">Знайти</button>
      </form>
    </div>
  );
}