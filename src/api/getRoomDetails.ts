import axios from "axios";
import { cache } from "react";
import { RoomsApiResponse } from "@/hooks/queries/useRooms";

export const getRoomDetails = cache(async ({ slug }: { slug: string }): Promise<RoomsApiResponse | null> => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_END_POINT}/properties/rooms`,
            { params: { room_slug: slug } }
        );
        const data = response.data;
        if (!data || data.error) return null;
        return data as RoomsApiResponse;
    } catch (error) {
        console.error("Error fetching property details:", error);
        return null;
    }
})
