'use client'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { Suspense, useEffect, useState } from "react"
import SearchBar from "@/components/commonComponents/SearchBar"
import SunbedSearchBar from "@/components/commonComponents/SunbedSearchBar"
import ImagePreview from "@/components/storyBook/atoms/ImagePreview"
import { useBanners } from "@/hooks/queries/useBanners"
import { Skeleton } from "@/components/ui/skeleton"
import { useSelector } from "react-redux"
import { businessModeSelector, bookingModeSelector } from "@/redux/reducers/settingsSlice"
import { useIsMobile } from "@/hooks/useMobile"
import { getDirection } from "@/utils/helpers"

const Slider = () => {

    const businessMode = useSelector(businessModeSelector)
    const bookingMode = useSelector(bookingModeSelector)
    const isSunbedMode = bookingMode === 'sunbed' || businessMode?.property_type === 'Resort';
    const isSingleHotel = businessMode?.business_mode === 'single';

    const isMobile = useIsMobile();

    const [mounted, setMounted] = useState(false)
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    const { data: banners = [], isLoading, isError, error } = useBanners();

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isError) {
            console.log("Banner API Error:", error?.message);
        }
    }, [isError])


    useEffect(() => {
        if (!api) return

        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    const resolvedIsSingleHotel = mounted ? isSingleHotel : false;
    const resolvedIsMobile = mounted ? isMobile : false;

    const handleRedirect = (url: string) => () => {
        if (!url) return
        window.open(url, '_blank')
    }

    return (
        <section className={`${resolvedIsSingleHotel ? 'w-full' : 'max-1680:!container 2xl:max-w-[1872px] mx-auto mt-28  md:mt-14'} flex flex-col-reverse md:block`}>
            {isLoading ? (
                <Skeleton className="w-full max-479:h-[143px] h-[250px] md:h-[390px] lg:h-[550px] 2xl:h-[750px] rounded-2xl" />
            ) : banners.length > 0 ? (
                <Carousel className="relative" setApi={setApi} dir={getDirection()}>
                    <CarouselContent>
                        {banners.map((item) => (
                            <CarouselItem key={item?.id} className={`relative ${item?.target_url ? 'cursor-pointer' : ''}`} onClick={handleRedirect(item?.target_url)}>
                                {/* Background Image with Overlay */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-black/20 rounded-2xl z-0" />
                                    <ImagePreview src={item?.image} alt={item?.title} className='aspect-1920/750!' rounded={`${resolvedIsSingleHotel ? 'none' : resolvedIsMobile ? '2xl' : 'none'}`} objectFit="cover" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Navigation Buttons - Hidden on Mobile */}
                    {
                        banners?.length > 1 && <>
                            <CarouselPrevious className="hidden md:flex left-4 md:left-8 w-10 h-10 rtl:rotate-180" />
                            <CarouselNext className="hidden md:flex right-4 md:right-8 w-10 h-10 rtl:rotate-180" />
                        </>
                    }

                    {/* Pagination Dots - Visible on Mobile */}
                    <div className="py-4 flexCenter gap-1 md:hidden">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${current === index
                                    ? 'w-6 primaryBg'
                                    : 'w-2 bg-[var(--neutral-300)]'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </Carousel>
            ) : null}
            <div className={`md:mb-0 md:-mt-10 relative z-1 md:pb-0 ${!isLoading && banners?.length < 1 ? "mt-30! md:mt-24!" : "mt-24 pb-8"}`}>
                <Suspense>
                    {isSunbedMode ? <SunbedSearchBar homePage={true} /> : <SearchBar homePage={true} />}
                </Suspense>
            </div>
        </section>
    )
}

export default Slider
