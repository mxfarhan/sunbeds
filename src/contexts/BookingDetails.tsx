'use client'
import { bookingDetailsSelector } from "@/redux/reducers/bookingDetailsSlice"
import { BookingDetailsData } from "@/types/GlobalTypes"
import { createContext, useContext, useState, ReactNode } from "react"
import { useSelector } from "react-redux"


type BookingDetailsContextType = {
    bookingData: BookingDetailsData
    setBookingData: React.Dispatch<React.SetStateAction<BookingDetailsData>>
}

const BookingDetailsContext = createContext<BookingDetailsContextType | undefined>(undefined)

export const BookingDetailsProvider = ({ children }: { children: ReactNode }) => {

    const defaultDetails = useSelector(bookingDetailsSelector);

    const [bookingData, setBookingData] = useState<BookingDetailsData>(defaultDetails)

    return (
        <BookingDetailsContext.Provider value={{ bookingData, setBookingData }}>
            {children}
        </BookingDetailsContext.Provider>
    )
}

export const useBookingDetails = () => {
    const context = useContext(BookingDetailsContext)
    if (!context) {
        throw new Error("useBookingDetails must be used within a BookingDetailsProvider")
    }
    return context
}
