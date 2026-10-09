export const formatPrice = (price: number) =>
  Intl.NumberFormat("vi-VN").format(price);
