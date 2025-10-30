import React, { useEffect, useRef, useState } from "react";
import { getHotels } from "../../API/api";
import { formatDate, formatPrice } from "../../utils/format";
import "../style/ToursList.css";

export default function ToursList({ tours, selected }) {
  const [hotels, setHotels] = useState({});
  const cacheRef = useRef({});

  const countryID = selected?.countryId || selected?.id;

  useEffect(() => {
    // якщо користувач ще нічого не вибрав → нічого не робимо
    if (!countryID) return;

    const loadHotels = async () => {
      // якщо готелі вже є в кеші → використовуємо їх
      if (cacheRef.current[countryID]) {
        console.log("📦 Використано кеш готелів для країни:", countryID);
        setHotels(cacheRef.current[countryID]);
        return;
      }

      console.log("🏨 Завантажуємо готелі для країни:", countryID);

      try {
        const res = await getHotels(countryID);
        const data = await res.json();

        cacheRef.current[countryID] = data; // кешуємо результат
    setHotels(data);

        // console.log("Готелі :", Object.keys(data).length);
      } catch (err) {
        // console.error("Помилка при завантаженні готелів:", err);
      }
    };

    loadHotels();
  }, [countryID]);

  if (!tours || tours.length === 0 || !countryID) return null;

  const toursWithHotels = tours.map((tour) => ({
    ...tour,
    hotel: hotels[tour.hotelID],
  }));

  return (
    <div className="tours-container">

      <div className="tours-grid">
        {toursWithHotels.map((tour) => {
          const hotel = tour.hotel;
          if (!hotel) return null;

          return (
            <div key={tour.id} className="tour-card">
              <img src={hotel.img} alt={hotel.name} className="hotel-img" />
              <p className="title">{hotel.name}</p>
              <p>
                {hotel.countryName}, {hotel.cityName}
              </p>
              <p className="dates">
                {formatDate(tour.startDate)}
              </p>
              <p className="price">{formatPrice(tour.amount, tour.currency)}</p>
              <button className="btn-link"><a href={`/tour/${hotel.id}/${tour.id}`}>Відкрити ціну</a></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
