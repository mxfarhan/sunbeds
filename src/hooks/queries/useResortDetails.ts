import { useQuery } from "@tanstack/react-query";
import { getResortDetailsApi } from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";

export interface ResortSlot {
  id: number;
  key: string;
  label: string;
  start_time?: string;
  end_time?: string;
}

export interface ResortMedia {
  id: number;
  url: string;
  media_type: 'image' | 'video';
  is_primary: boolean;
}

export interface ResortArea {
  id: number;
  name: string;
  image: string | null;
}

export interface ResortDetails {
  id: number;
  slug: string;
  name: string;
  description: string;
  rating: number;
  review_count: number;
  starting_price: number;
  currency_code: string;
  currency_symbol: string;
  address: string;
  city: string | null;
  country?: string | null;
  latitude: string | null;
  longitude: string | null;
  place_id?: string | null;
  opening_time: string | null;
  closing_time: string | null;
  allow_reviews: boolean;
  media: ResortMedia[];
  images: string[];
  facilities: string[];
  areas: ResortArea[];
  slots: ResortSlot[];
}

export interface ResortDetailsApiResponse extends Omit<ApiResponseType, "data"> {
  data: ResortDetails;
}

export const useResortDetails = (slug: string, enabled = true) => {
  return useQuery<ResortDetailsApiResponse>({
    queryKey: ["resortDetails", slug],
    enabled: enabled && !!slug,
    queryFn: async () => {
      try {
        const response = await getResortDetailsApi({ slug });
        if (response?.error) {
          throw new Error(response?.message || "Failed to fetch resort details");
        }
        return response as ResortDetailsApiResponse;
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || error?.message || "Failed to fetch resort details";
        throw new Error(apiMessage);
      }
    },
  });
};
