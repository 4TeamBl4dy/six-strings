import instance from './instance';

// Define interfaces for StatItem and DetailItem based on StatsPage.tsx
export interface DetailItem {
   date: string;
   productId: string;
   productName: string;
   userId: string;
   userLogin: string;
}

export interface StatItem {
   _id: string;
   total: number;
}

export interface StatsResponse {
   basket: StatItem[];
   favorites: StatItem[];
   basketDetails: DetailItem[];
   favoritesDetails: DetailItem[];
}

export const getStats = (sellerLogin: string) => instance.get<StatsResponse>('/stats', { params: { sellerLogin } });
