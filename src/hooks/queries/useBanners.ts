import { useQuery } from "@tanstack/react-query";
import { getBannersApi } from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";

export interface Banner {
  id: number;
  title: string;
  image: string;
  target_url: string;
  start_date: string | null;
  end_date: string | null;
}

export const useBanners = (countryId?: number) => {
  return useQuery({
    queryKey: ["banners", countryId],
    queryFn: async () => {
      try {
        const response = await getBannersApi({ country_id: countryId});
        if (response?.error) {
          throw new Error(response?.message || "Failed to fetch banners");
        }
        return response;
      } catch (error: any) {
        // Axios throws on non-2xx status codes, extract the actual API message
        const apiMessage = error?.response?.data?.message || error?.message || "Failed to fetch banners";
        throw new Error(apiMessage);
      }
    },
    select: (response: ApiResponseType) => (response?.data as Banner[]) ?? [],
  });
};