export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseIDR = (display: string): number => {
  return parseInt(display.replace(/\D/g, "") || "0", 10);
};

export const formatInputIDR = (raw: string): string => {
  const numeric = raw.replace(/\D/g, "");
  if (!numeric) return "";
  return new Intl.NumberFormat('id-ID').format(parseInt(numeric, 10));
};
