import axios from "axios";
import { cache } from "react";
import { Language } from "@/hooks/queries/useSettings";
import { getServerApiBase } from "@/lib/apiBase";

export const getDefaultLanguage = cache(async ({
  lang_code,
}: {
  lang_code?: string;
} = {}): Promise<Language | null> => {
  try {
    const response = await axios.get(
      `${getServerApiBase()}/language`,
      { params: lang_code ? { lang_code } : undefined }
    );
    const data = response.data;
    if (!data || data.error) return null;
    return (data.data as Language) ?? null;
  } catch (error) {
    console.error("Error fetching default language:", error);
    return null;
  }
});
