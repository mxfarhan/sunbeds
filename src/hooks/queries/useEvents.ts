import { useQuery } from "@tanstack/react-query";
import { getEventsApi } from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";

export interface EventsItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    image: string;
    features: string[];
}

export interface EventsData {
    items: EventsItem[];
}

export interface EventsFilters {
    country_id?: number;
}

export interface EventsApiResponse extends Omit<ApiResponseType, 'data'> {
    data: EventsData;
}

export const useEvents = (filters: EventsFilters) => {
    return useQuery<EventsApiResponse>({
        queryKey: ["events", filters],
        queryFn: async () => {
            try {
                const response = await getEventsApi({country_id: filters.country_id});
                if (!response) {
                    throw new Error("Failed to fetch events");
                }
                if (response?.error) {
                    throw new Error(response?.message || "Failed to fetch events");
                }
                return response as EventsApiResponse;
            } catch (error: any) {
                const apiMessage = error?.response?.data?.message || error?.message || "Failed to fetch events";
                throw new Error(apiMessage);
            }
        },
    });
};