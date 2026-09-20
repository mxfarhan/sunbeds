import { useQuery } from "@tanstack/react-query";
import { getTranslationsApi } from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";
import localEn from "@/utils/locale/en.json";

export interface TranslationsData {
    lang_code: string;
    platform_type: string;
    translations: Record<string, string>;
}

export interface TranslationsFilters {
    lang_code?: string;
}

export interface TranslationsApiResponse extends Omit<ApiResponseType, 'data'> {
    data: TranslationsData;
}

export const useLangTranslations = (filters: TranslationsFilters) => {
    return useQuery<TranslationsApiResponse>({
        queryKey: ["translations", filters],
        enabled: !!filters.lang_code,
        queryFn: async () => {
            try {
                const response = await getTranslationsApi({ lang_code: filters.lang_code, platform_type: 'web' });
                if (!response) {
                    throw new Error("Failed to fetch translations");
                }
                if (response?.error) {
                    throw new Error(response?.message || "Failed to fetch translations");
                }
                return response as TranslationsApiResponse;
            } catch {
                return {
                    success: true,
                    message: 'Using local translations',
                    data: {
                        lang_code: filters.lang_code ?? 'en',
                        platform_type: 'web',
                        translations: localEn as Record<string, string>,
                    },
                } as TranslationsApiResponse;
            }
        },
    });
};
