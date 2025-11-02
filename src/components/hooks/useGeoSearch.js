import { useEffect, useRef, useState } from "react";
import { getCountries, searchGeo } from "../../API/api";

export function useGeoSearch() {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const wrapperRef = useRef(null);
  const skipNextSuggestRef = useRef(false);

  const ICONS = {
    country: "/img/globe.svg",
    city: "/img/cityscape.svg",
    hotel: "/img/stars.svg",
  };

  const cacheRef = useRef({});

  const addIcons = (data) =>
    Object.values(data).map((item) => ({
      ...item,
      icon: ICONS[item.type] || ICONS.country,
    }));

  const fetchCountries = async () => {
    if (cacheRef.current.countries) {
      setOptions(cacheRef.current.countries);
      return;
    }
    try {
      const res = await getCountries();
      const data = await res.json();
      const withIcons = addIcons(
        Object.values(data).map((c) => ({ ...c, type: "country" }))
      );
      cacheRef.current.countries = withIcons;
      setOptions(withIcons);
    } catch {}
  };

  const fetchGeoResults = async (value) => {
    if (!value.trim()) return fetchCountries();

    const lower = value.toLowerCase();

    if (cacheRef.current[value]) {
      const cached = cacheRef.current[value];
      const sorted = [...cached].sort((a, b) => {
        const aMatch = a.name.toLowerCase().startsWith(lower) ? -1 : 1;
        const bMatch = b.name.toLowerCase().startsWith(lower) ? -1 : 1;
        return aMatch - bMatch;
      });
      setOptions(sorted);
      return;
    }

    try {
      const res = await searchGeo(value);
      const data = await res.json();
      const withIcons = addIcons(data);

      const sorted = withIcons.sort((a, b) => {
        const aMatch = a.name.toLowerCase().startsWith(lower) ? -1 : 1;
        const bMatch = b.name.toLowerCase().startsWith(lower) ? -1 : 1;
        return aMatch - bMatch;
      });

      cacheRef.current[value] = sorted;
      setOptions(sorted);
    } catch {}
  };

  const handleFocus = () => {
    setIsOpen(true);

    if (!query) {
      fetchCountries();
    } else if (selected?.type === "country") {
      fetchCountries();
    } else {
      fetchGeoResults(query);
    }
  };

  useEffect(() => {
    if (skipNextSuggestRef.current) {
      skipNextSuggestRef.current = false;
      return;
    }

    if (query.trim()) {
      setIsOpen(true);
      fetchGeoResults(query);
    } else {
      fetchCountries();
    }
  }, [query]);

  const handleSelect = (item) => {
    skipNextSuggestRef.current = true;
    setSelected(item);
    setQuery(item.name);
    setIsOpen(false);
  };

  const handleChange = (value) => {
    setQuery(value);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setIsOpen(true);
    fetchGeoResults(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    query,
    setQuery,
    options,
    isOpen,
    selected,
    wrapperRef,
    handleFocus,
    handleChange,
    handleSelect,
    handleSearch,
    handleKeyDown,
  };
}
