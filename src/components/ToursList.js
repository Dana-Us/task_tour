import React, { useEffect, useRef, useState } from "react";
import { getHotels } from "./../API/api";
import TourCard from "./TourCard";

export default function ToursList({ tours, selected }) {
  const [hotels, setHotels] = useState({});
  const cacheRef = useRef({});

  const countryID = selected?.countryId || selected?.id;

  useEffect(() => {
    if (!countryID) return;

    const loadHotels = async () => {
      if (cacheRef.current[countryID]) {
        setHotels(cacheRef.current[countryID]);
        return;
      }

      try {
        const res = await getHotels(countryID);
        const data = await res.json();

        cacheRef.current[countryID] = data;
        setHotels(data);
      } catch (err) {
        // console.error("Помилка при завантаженні готелів:", err);
      }
    };

    loadHotels();
  }, [countryID]);

  if (!tours || tours.length === 0 || !countryID) return null;

  const toursWithHotels = tours
    .map((tour) => ({
      ...tour,
      hotel: hotels[tour.hotelID],
    }))
    .sort((a, b) => a.amount - b.amount);

  return (
    <div className="tours-container">
      <div className="tours-grid">
        {toursWithHotels.map((tour) => (
          <TourCard
            key={tour.id}
            hotel={tour.hotel}
            tour={tour}
            variant="list"
          />
        ))}
      </div>
    </div>
  );
}
