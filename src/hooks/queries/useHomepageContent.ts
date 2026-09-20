import { useQuery } from "@tanstack/react-query";
import { getHomepageContentApi } from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";


export interface AboutUsContent {
    title: string;
    description: string;
    button_text: string;
    contact_no: string;
    image: string;
}

export interface Facility {
    id: number;
    name: string;
    icon: string | null;
    category: string | null;
}

export interface Amenity {
    id: number;
    sort_order: number;
    description: string;
    facility: Facility;
}

export interface HomepageContentData {
    about_us: AboutUsContent;
    amenities: Amenity[];
    featured_reviews: any[];
}

export interface HomepageContentApiResponse extends Omit<ApiResponseType, 'data'> {
    data: HomepageContentData;
}

export const useHomepageContent = () => {
    return useQuery<HomepageContentApiResponse>({
        queryKey: ["homepageContent"],
        queryFn: async () => {
            try {
                const response = await getHomepageContentApi();
                if (!response) {
                    throw new Error("Failed to fetch settings");
                }
                if (response?.error) {
                    throw new Error(response?.message || "Failed to fetch settings");
                }
                return response as HomepageContentApiResponse;
            } catch (error: any) {
                const apiMessage = error?.response?.data?.message || error?.message || "Failed to fetch settings";
                throw new Error(apiMessage);
            }
        },
    });
};