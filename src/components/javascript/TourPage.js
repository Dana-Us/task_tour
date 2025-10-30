import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHotel, getPrice } from "../../API/api";
import { formatDate, formatPrice } from "../../utils/format";
import "../style/TourPage.css";

export default function TourPage() {
  const { hotelId, priceId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {

        const [hotelRes, priceRes] = await Promise.all([
          getHotel(Number(hotelId)),
          getPrice(priceId),
        ]);

        const hotelData = await hotelRes.json();
        const priceData = await priceRes.json();

        setHotel(hotelData);
        setPrice(priceData);
        setLoading(false);
      } catch (err) {
        setError("Не вдалося отримати дані туру");
        setLoading(false);
      }
    };

    loadData();
  }, [hotelId, priceId]);

  if (loading) return <p className="loading">Завантаження</p>;
  if (error) return <p className="error">{error}</p>;
  if (!hotel || !price) return <p className="error">Дані не знайдено</p>;

  return (
    <div className="tour-page">
        <p className="title">{hotel.name}</p>
        <p className="hotel-location">
            {hotel.countryName} — {hotel.cityName}
        </p>

        <img src={hotel.img} alt={hotel.name} className="hotel-image" />

        <p className="discription">Опис</p>
        <p className="hotel-description">{hotel.description}</p>

        <p className="discription">Сервіси</p>

        <ul className="services-list">
        {Object.entries(hotel?.services || {})
            .filter(([_, value]) => value === "yes") 
            .map(([key]) => (
            <li key={key}>{key}</li>
            ))}
        </ul>

        <div className="tour-info">
            <p>
            {formatDate(price.startDate)} — {formatDate(price.endDate)}
            </p>

            <p className="price">
            {formatPrice(price.amount, price.currency)}
            </p>
      </div>
    </div>
  );
}
