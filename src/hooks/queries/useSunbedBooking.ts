import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getSunbedBookingTicketApi,
  sunbedBookingConfirmApi,
  sunbedBookingLockApi,
  sunbedBookingQuoteApi,
  sunbedBookingWithPaymentApi,
} from "@/api/apiRoutes";
import { ApiResponseType } from "@/types/GlobalTypes";

export interface SunbedQuoteSunbed {
  id: number;
  code: string;
  price: number;
}

export interface SunbedQuotePricing {
  base_amount: number;
  tax_amount: number;
  tax_details: { name: string; type: string; value: number; amount: number }[];
  total_amount: number;
}

export interface SunbedQuoteData {
  property: { id: number; name: string; slug: string };
  booking_date: string;
  slot: { id: number; label: string };
  sunbeds: SunbedQuoteSunbed[];
  pricing: SunbedQuotePricing;
  payment?: {
    available_gateways: string[];
  };
}

export interface SunbedQuoteApiResponse extends Omit<ApiResponseType, "data"> {
  data: SunbedQuoteData;
}

export interface SunbedLockData {
  lock_group: string;
  property_id: number;
  booking_date: string;
  sunbed_slot_id: number;
  sunbed_ids: number[];
  expires_at: string;
  expires_in_seconds: number;
  status: string;
}

export interface SunbedLockApiResponse extends Omit<ApiResponseType, "data"> {
  data: SunbedLockData;
}

export interface SunbedBookingPayload {
  property_id: number;
  sunbed_slot_id: number;
  booking_date: string;
  sunbed_ids: number[];
}

export interface SunbedConfirmPayload {
  lock_group: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_dial_code?: string;
}

export interface SunbedPaymentPayload extends SunbedConfirmPayload {
  gateway_type: "razorpay" | "stripe" | "flutterwave";
  payment_type?: "full" | "partial";
}

export interface SunbedTicketData {
  booking_number: string;
  booking_date: string;
  status: string;
  sunbeds: string[];
  qr_token: string | null;
  checked_in_at: string | null;
}

export interface SunbedTicketApiResponse extends Omit<ApiResponseType, "data"> {
  data: SunbedTicketData;
}

export const useSunbedQuote = () => {
  return useMutation<SunbedQuoteApiResponse, Error, SunbedBookingPayload>({
    mutationFn: async (payload) => {
      try {
        const response = await sunbedBookingQuoteApi(payload);
        if (response?.error) {
          throw new Error(response?.message || "Failed to get sunbed quote");
        }
        return response as SunbedQuoteApiResponse;
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || error?.message || "Failed to get sunbed quote";
        throw new Error(apiMessage);
      }
    },
  });
};

export const useSunbedLock = () => {
  return useMutation<SunbedLockApiResponse, Error, SunbedBookingPayload>({
    mutationFn: async (payload) => {
      try {
        const response = await sunbedBookingLockApi(payload);
        if (response?.error) {
          throw new Error(response?.message || "Failed to lock sunbeds");
        }
        return response as SunbedLockApiResponse;
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || error?.message || "Failed to lock sunbeds";
        throw new Error(apiMessage);
      }
    },
  });
};

export const useSunbedConfirm = () => {
  return useMutation<ApiResponseType, Error, SunbedConfirmPayload>({
    mutationFn: async (payload) => {
      try {
        const response = await sunbedBookingConfirmApi(payload);
        if (response?.error) {
          throw new Error(response?.message || "Failed to confirm sunbed booking");
        }
        return response;
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || error?.message || "Failed to confirm sunbed booking";
        throw new Error(apiMessage);
      }
    },
  });
};

export const useSunbedBookingWithPayment = () => {
  return useMutation<ApiResponseType, Error, SunbedPaymentPayload>({
    mutationFn: async (payload) => {
      try {
        const response = await sunbedBookingWithPaymentApi(payload);
        if (response?.error) {
          throw new Error(response?.message || "Failed to initiate sunbed payment");
        }
        if ((response?.data as { payment_error?: string })?.payment_error) {
          const paymentError = (response?.data as { payment_error?: string }).payment_error!;
          const err = new Error("Booking saved but payment could not be started.") as Error & {
            bookingData?: ApiResponseType["data"];
            gatewayError?: string;
          };
          err.bookingData = response.data;
          err.gatewayError = paymentError;
          throw err;
        }
        return response;
      } catch (error: any) {
        const res = error?.response?.data;
        if (res?.data?.booking) {
          const err = new Error(res.message || "Payment could not be started.") as Error & {
            bookingData?: ApiResponseType["data"];
            gatewayError?: string;
          };
          err.bookingData = res.data;
          err.gatewayError = res.data?.gateway_error;
          throw err;
        }
        const apiMessage = res?.message || error?.message || "Failed to initiate sunbed payment";
        throw new Error(apiMessage);
      }
    },
  });
};

export const useSunbedTicket = (bookingNumber: string, enabled = true) => {
  return useQuery<SunbedTicketApiResponse>({
    queryKey: ["sunbedTicket", bookingNumber],
    enabled: enabled && !!bookingNumber,
    queryFn: async () => {
      try {
        const response = await getSunbedBookingTicketApi({ bookingNumber });
        if (response?.error) {
          throw new Error(response?.message || "Failed to fetch sunbed ticket");
        }
        return response as SunbedTicketApiResponse;
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || error?.message || "Failed to fetch sunbed ticket";
        throw new Error(apiMessage);
      }
    },
  });
};
