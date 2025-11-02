import { useState, useRef } from "react";
import { startSearchPrices, getSearchPrices, stopSearchPrices, } from "../../API/api";

export function useCancelableSearchTours() {
  const [tours, setTours] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const cacheRef = useRef({});
  const retryRef = useRef(0);
  const activeTokenRef = useRef(null);
  const cancelingRef = useRef(false);
  const timeoutRef = useRef(null);
  const pendingSelectionRef = useRef(null); 
  const resetButtonState = () => setIsButtonDisabled(false);


  const waitUntil = async (isoTime) => {
    const delay = new Date(isoTime).getTime() - Date.now();
    if (delay > 0) await new Promise((res) => (timeoutRef.current = setTimeout(res, delay)));
  };

  const cancelActiveSearch = async () => {
    const token = activeTokenRef.current;
    if (!token) return;

    cancelingRef.current = true;
    setStatus("canceling");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    try {
      await stopSearchPrices(token);
    } catch {
    } finally {
      activeTokenRef.current = null;
      cancelingRef.current = false;
      setStatus("idle");

      if (pendingSelectionRef.current) {
        const nextSelection = pendingSelectionRef.current;
        pendingSelectionRef.current = null;
        searchTours(nextSelection);
      }
    }
  };

  const searchTours = async (selection) => {
    if (!selection) return;

    const countryID =
      selection.type === "country" ? selection.id : selection.countryId;
    if (!countryID) {
      setError("Неможливо визначити країну для пошуку");
      setStatus("error");
      return;
    }

    setIsButtonDisabled(true);

    if (cancelingRef.current) {
      pendingSelectionRef.current = selection;
      return;
    }

    if (activeTokenRef.current) {
      pendingSelectionRef.current = selection; 
      await cancelActiveSearch(); 
      return;
    }

    if (cacheRef.current[countryID]) {
      setTours(cacheRef.current[countryID]);
      setStatus("success");
      setIsButtonDisabled(false);
      return;
    }

    setStatus("loading");
    setError(null);
    retryRef.current = 0;

    try {
      const startRes = await startSearchPrices(countryID);
      const startData = await startRes.json();

      activeTokenRef.current = startData.token;
      await waitUntil(startData.waitUntil);
      await getResults(startData.token, countryID);
    } catch (err) {
      setError("Не вдалося запустити пошук турів");
      setStatus("error");
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const getResults = async (token, countryID) => {
    if (cancelingRef.current || token !== activeTokenRef.current) {
      return;
    }

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

        if (errorData.code === 425 && !cancelingRef.current) {
          await waitUntil(errorData.waitUntil);
          return getResults(token, countryID);
        }

        if (retryRef.current < 2 && !cancelingRef.current) {
          retryRef.current++;
          await new Promise((res) => setTimeout(res, 2000));
          return getResults(token, countryID);
        }

        setError(errorData.message || "Помилка при отриманні результатів");
        setStatus("error");
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
    isButtonDisabled,
    resetButtonState,
  };
}
