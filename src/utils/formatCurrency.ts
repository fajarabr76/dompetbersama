export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseIDR = (display: string): number => {
  const isNegative = display.trim().startsWith('-');
  const numeric = display.replace(/\D/g, "");
  const value = parseInt(numeric || "0", 10);
  return isNegative ? -value : value;
};

export const formatInputIDR = (raw: string): string => {
  const isNegative = raw.trim().startsWith('-');
  const numeric = raw.replace(/\D/g, "");
  if (!numeric) return isNegative ? "-" : "";
  const formatted = new Intl.NumberFormat('id-ID').format(parseInt(numeric, 10));
  return isNegative ? `-${formatted}` : formatted;
};
