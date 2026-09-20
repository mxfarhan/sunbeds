import axios from "axios";
import { cache } from "react";
import { PropertiesApiResponse } from "@/hooks/queries/usePropertyDetails";

export const getPropertyDetails = cache(async ({ slug }: { slug: string }): Promise<PropertiesApiResponse | null> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_END_POINT}/property-details`,
      { params: { slug } }
    );
    const data = response.data;
    if (!data || data.error) return null;
    return data as PropertiesApiResponse;
  } catch (error) {
    console.error("Error fetching property details:", error);
    return null;
  }
})
