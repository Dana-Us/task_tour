import React from "react";
import { formatDate, formatPrice } from "../utils/format";
import "./style/ToursList.css";
import "./style/TourPage.css";

export default function TourCard({ hotel, tour, variant = "list" }) {
  if (!hotel) return null;
  const isPage = variant === "page";

  return (
    <div className={isPage ? "tour-page" : "tour-card"}>
      <img
        src={hotel.img}
        alt={hotel.name}
        className={isPage ? "hotel-image" : "hotel-img"}
      />

      <p className={isPage ? "title" : "title-list"}>{hotel.name}</p>
      <p className="hotel-location">
        {hotel.countryName}, {hotel.cityName}
      </p>

      {tour && (
        <div className={isPage ? "price-info" : "dates"}>
          <p>{formatDate(tour.startDate)}</p>
          <p className="price">{formatPrice(tour.amount, tour.currency)}</p>
        </div>
      )}

      {isPage && (
        <>
          <p className="discription">Опис</p>
          <p className="hotel-description">{hotel.description}</p>
          <p className="discription">Сервіси</p>
          <ul className="services-list">
            {Object.entries(hotel.services || {})
              .filter(([_, value]) => value === "yes")
              .map(([key]) => (
                <li key={key}>{key}</li>
              ))}
          </ul>
        </>
      )}

      {!isPage && (
        <button className="btn-link">
          <a href={`/tour/${hotel.id}/${tour.id}`}>Відкрити ціну</a>
        </button>
      )}
    </div>
  );
}
