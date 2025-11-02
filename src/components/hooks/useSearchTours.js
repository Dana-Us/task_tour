import { useState, useRef } from "react";
import { startSearchPrices, getSearchPrices } from "../../API/api";

export function useSearchTours() {
  const [tours, setTours] = useState([]); 
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null); 

  const cacheRef = useRef({});
  const retryRef = useRef(0);  

  const waitUntil = async (isoTime) => {
    const delay = new Date(isoTime).getTime() - Date.now();
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  const searchTours = async (selection) => {
    if (!selection) {
      return;
    }

    const countryID = selection.type === "country" ? selection.id : selection.countryId;

    if (!countryID) {
      setError("Неможливо визначити країну для пошуку");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    retryRef.current = 0;

    if (cacheRef.current[countryID]) {
      setTours(cacheRef.current[countryID]);
      setStatus("success");
      return;
    }

    try {
      const startRes = await startSearchPrices(countryID);
      const startData = await startRes.json();

      await waitUntil(startData.waitUntil);

      await getResults(startData.token, countryID);
    } catch (err) {
      setError("Не вдалося запустити пошук турів");
      setStatus("error");
    }
  };

  const getResults = async (token, countryID) => {
    try {
      const res = await getSearchPrices(token);
      const data = await res.json();

      const list = Object.values(data.prices || {});
      if (list.length === 0) {
        setTours([]);
        setStatus("empty");
        return;
      }

      cacheRef.current[countryID] = list;
      setTours(list);
      setStatus("success");
    } catch (err) {
      if (err instanceof Response) {
        const errorData = await err.json();

        if (errorData.code === 425) {
          await waitUntil(errorData.waitUntil);
          return getResults(token, countryID);
        }

        if (retryRef.current < 2) {
          retryRef.current++;
          await new Promise((res) => setTimeout(res, 2000));
          return getResults(token, countryID);
        } else {
          setError(errorData.message || "Помилка при отриманні результатів");
          setStatus("error");
        }
      } else {
        setError("Невідома помилка при пошуку турів");
        setStatus("error");
      }
    }
  };

  return {
    tours,
    status,
    error,
    searchTours,
  };
}
