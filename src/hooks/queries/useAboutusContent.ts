import { useQuery } from "@tanstack/react-query";
import { getAboutUsContentApi } from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";


export interface KeyHighlight {
    id: number;
    title: string;
    description: string;
    sort_order: number;
}

export interface OurPromise {
    badge_text: string;
    title: string;
    content: string;
    image: string;
    features: string[];
}

export interface WhoWeAre {
    badge_text: string;
    title: string;
    short_description: string;
    content: string;
    image: string;
}

export interface AboutUsPageContentData {
    who_we_are: WhoWeAre;
    key_highlights: KeyHighlight[];
    our_promise: OurPromise;
}

export interface AboutUsPageContentApiResponse extends Omit<ApiResponseType, 'data'> {
    data: AboutUsPageContentData;
}

export const useAboutUsContent = () => {
    return useQuery<AboutUsPageContentApiResponse>({
        queryKey: ["aboutUsContent"],
        queryFn: async () => {
            try {
                const response = await getAboutUsContentApi();
                if (!response) {
                    throw new Error("Failed to fetch settings");
                }
                if (response?.error) {
                    throw new Error(response?.message || "Failed to fetch settings");
                }
                return response as AboutUsPageContentApiResponse;
            } catch (error: any) {
                const apiMessage = error?.response?.data?.message || error?.message || "Failed to fetch settings";
                throw new Error(apiMessage);
            }
        },
    });
};