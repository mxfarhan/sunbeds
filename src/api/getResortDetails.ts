import axios from "axios";
import { cache } from "react";
import { ResortDetailsApiResponse } from "@/hooks/queries/useResortDetails";
import { getServerApiBase } from "@/lib/apiBase";

export const getResortDetails = cache(async ({ slug }: { slug: string }): Promise<ResortDetailsApiResponse | null> => {
  try {
    const response = await axios.get(
      `${getServerApiBase()}/resorts/${slug}`,
      { timeout: 12000 }
    );
    const data = response.data;
    if (!data || data.error) return null;
    return data as ResortDetailsApiResponse;
  } catch (error) {
    console.error("Error fetching resort details:", error);
    return null;
  }
});
