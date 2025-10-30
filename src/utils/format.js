export const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatPrice = (amount, currency) => {
  if (!amount) return "";
  const formatter = new Intl.NumberFormat("uk-UA");
  const symbols = { usd: "$", eur: "€", uah: "грн" };
  return `${formatter.format(amount)} ${symbols[currency] || currency}`;
};
