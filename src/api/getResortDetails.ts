import axios from "axios";
import { cache } from "react";
import { ResortDetailsApiResponse } from "@/hooks/queries/useResortDetails";

export const getResortDetails = cache(async ({ slug }: { slug: string }): Promise<ResortDetailsApiResponse | null> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_END_POINT}/resorts/${slug}`
    );
    const data = response.data;
    if (!data || data.error) return null;
    return data as ResortDetailsApiResponse;
  } catch (error) {
    console.error("Error fetching resort details:", error);
    return null;
  }
});
