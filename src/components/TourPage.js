import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHotel, getPrice } from "../API/api";
import TourCard from "./TourCard";

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

  return <TourCard hotel={hotel} tour={price} variant="page" />;
}
