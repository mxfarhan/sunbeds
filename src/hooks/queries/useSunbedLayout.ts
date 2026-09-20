import { useQuery } from "@tanstack/react-query";
import { getSunbedLayoutApi } from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";
import type {
  SunbedLayoutData,
  SunbedStatus,
  LayoutSunbed,
  LayoutArea,
  LayoutRow,
  AreaLayoutMeta,
} from "@/layout-engine/types";

export type { SunbedStatus, LayoutSunbed, LayoutArea, LayoutRow, AreaLayoutMeta, SunbedLayoutData };

export interface SunbedLayoutApiResponse extends Omit<ApiResponseType, "data"> {
  data: SunbedLayoutData;
}

export interface SunbedLayoutFilters {
  slug: string;
  date: string;
  slot_id: number;
}

export const useSunbedLayout = (filters: SunbedLayoutFilters, enabled = true) => {
  return useQuery<SunbedLayoutApiResponse>({
    queryKey: ["sunbedLayout", filters],
    enabled: enabled && !!filters.slug && !!filters.date && !!filters.slot_id,
    queryFn: async () => {
      try {
        const response = await getSunbedLayoutApi({
          slug: filters.slug,
          date: filters.date,
          slot_id: String(filters.slot_id),
        });
        if (response?.error) {
          throw new Error(response?.message || "Failed to fetch sunbed layout");
        }
        return response as SunbedLayoutApiResponse;
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const apiMessage = err?.response?.data?.message || err?.message || "Failed to fetch sunbed layout";
        throw new Error(apiMessage);
      }
    },
    staleTime: 0,
  });
};
