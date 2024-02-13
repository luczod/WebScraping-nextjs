export type TPriceHistoryItem = {
  price: number;
};

export type TUser = {
  email: string;
};

export type TProduct = {
  _id?: string;
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: TPriceHistoryItem[] | [];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: string;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: Boolean;
  users?: TUser[];
};

export type TNotification = 'WELCOME' | 'CHANGE_OF_STOCK' | 'LOWEST_PRICE' | 'THRESHOLD_MET';

export type TEmailContent = {
  subject: string;
  body: string;
};

export type TEmailProductInfo = {
  title: string;
  url: string;
};
