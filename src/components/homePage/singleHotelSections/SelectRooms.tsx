'use client'
import { useTranslation } from '@/hooks/useTranslation';
import { PiArrowRight, PiArrowUpRight, PiBed, PiUsers } from 'react-icons/pi';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel"
import { useEffect, useState } from 'react';
import SectionInfo from '@/components/storyBook/molecules/SectionInfo';
import Link from 'next/link';
import { Button } from '@/components/storyBook/atoms/Button';
import SwiperBullets from '@/components/storyBook/atoms/SwiperBullets';
import { useDispatch, useSelector } from 'react-redux';
import { businessModeSelector } from '@/redux/reducers/settingsSlice';
import { BasicDetails } from '@/hooks/queries/useSettings';
import { Room, RoomProperty, useRooms } from '@/hooks/queries/useRooms';
import { useRouter } from 'next/navigation';
import { setSelectedRoom } from '@/redux/reducers/helpersReducer';
import { Property, useProperties } from '@/hooks/queries/useProperties';
import VerticalCard from '@/components/storyBook/molecules/PropertyCard/verticalCard';
import ImagePreview from '@/components/storyBook/atoms/ImagePreview';
import { Typography } from '@/components/storyBook/atoms/Typography';
import Divider from '@/components/storyBook/atoms/Divider'
import SelectRoomsSkeleton from '@/components/skeletons/SelectRoomsSkeleton';
import { currentLangCodeSelector } from '@/redux/reducers/languageSlice';
import IconLabel from '@/components/storyBook/atoms/IconLabel';

const SelectRooms = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const router = useRouter();
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
    const [roomsData, setRoomsData] = useState<Room[]>([])
    const [propertiesData, setPropertiesData] = useState<Property[]>([])

    const businessMode = useSelector(businessModeSelector) as BasicDetails;
    const isSingleHotel = businessMode?.business_mode === 'single' && businessMode?.no_of_properties === 1;

    const langCode = useSelector(currentLangCodeSelector);

    const { data: roomResData, isLoading: roomsLoading, error: roomsError, isError: roomsErrorFlag } = useRooms({
        property_slug: businessMode?.slug,
    }, 1, isSingleHotel);

    const { data: propertiesResData, isLoading: propertiesLoading, error: propertiesError, isError: propertiesErrorFlag } = useProperties({

    }, 1, !isSingleHotel);

    useEffect(() => {
        if (isSingleHotel) {
            if (roomsErrorFlag || roomsError) {
                setRoomsData([])
                console.log("selectRoom error =>", roomsError)
            }
            else {
                setRoomsData(roomResData?.data?.items!)
            }
        } else {
            if (propertiesErrorFlag || propertiesError) {
                setPropertiesData([])
                console.log("selectProperty error =>", propertiesError)
            } else {
                setPropertiesData(propertiesResData?.data!.items!)
            }
        }
    }, [roomResData, propertiesResData, roomsErrorFlag, propertiesErrorFlag])

    useEffect(() => {
        if (!api) return

        setCurrent(api.selectedScrollSnap())
        setScrollSnaps(api.scrollSnapList())

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap())
        }

        const onReInit = () => {
            setScrollSnaps(api.scrollSnapList())
            setCurrent(api.selectedScrollSnap())
        }

        api.on("select", onSelect)
        api.on("reInit", onReInit)

        return () => {
            api.off("select", onSelect)
            api.off("reInit", onReInit)
        }
    }, [api]);


    const handleRedirectDetailPage = (selectedData: Room | Property) => {
        const room = selectedData as Room;
        const property = selectedData as Property;

        const selectedRoomProperty = roomResData?.data?.property;


        if (isSingleHotel) {
            dispatch(setSelectedRoom({ room: room, property: selectedRoomProperty as RoomProperty }))
            router.push(`/${langCode}/rooms/${room?.slug}`)
        }
        else {
            router.push(`/${langCode}/properties/${property?.slug}`)
        }
    }

    const isLoading = isSingleHotel ? roomsLoading : propertiesLoading

    if (isLoading) return <SelectRoomsSkeleton isSingleHotel={isSingleHotel} />

    return (
        <section className='container commonPY'>
            <div className='space-y-3 sm:space-y-6 md:space-y-12'>
                <div className='flex items-end justify-between'>
                    {
                        roomsData?.length > 1 || propertiesData?.length > 1 &&
                        <SectionInfo badge={t(isSingleHotel ? 'selectRooms' : 'selectProperty')} title={t('findPerfectRooms')} desc={t('findPerfectRoomsDesc')} />
                    }
                    {
                        isSingleHotel ? roomsData?.length > 4 : propertiesData?.length > 5 &&
                            <div className='hidden sm:flexCenter gap-1'>
                                <Link href={isSingleHotel ? `/${langCode}/rooms` : `/${langCode}/properties`}>
                                    <Button variant='secondary' size='md' className='btn_md md:btn_lg' rightIcon={<PiArrowRight className='text-2xl rtl:rotate-180' />} children={t(isSingleHotel ? 'viewAllRooms' : 'viewAllProperties')} />
                                </Link>
                            </div>
                    }
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                    setApi={setApi}
                >
                    {
                        isSingleHotel ?
                            <CarouselContent className="-ml-4 md:-ml-6">
                                {roomsData?.map((room) => (
                                    <CarouselItem
                                        key={room?.id}
                                        className="pl-4 md:pl-6 basis-[65%] between-400-575:basis-[55%] sm:basis-[45%] lg:basis-1/3 xl:basis-1/4 cursor-pointer pb-3 group transition-all duration-500"
                                        onClick={() => handleRedirectDetailPage(room)}
                                    >
                                        <div className="flex flex-col gap-3 border rounded-2xl p-4">
                                            <div className="relative h-38.5 md:h-72.5 w-full aspect-4/3 rounded-2xl overflow-hidden">
                                                <ImagePreview
                                                    src={room?.room_type?.images[0]?.url}
                                                    alt={room?.room_type?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className='hidden md:flex gap-4 absolute -bottom-12 bg-black text-white w-full p-2 group-hover:bottom-0 transition-all duration-500 z-2'>
                                                    <IconLabel icon={<PiUsers className='text-xl' />} label={room?.room_type?.max_guests.toString()} className='w-max' />
                                                    <IconLabel icon={<PiBed className='text-xl' />} label={room?.room_type?.bed_type.toString()} className='w-max [&>span]:line-clamp-1!' />
                                                </div>
                                                <div className='absolute h-full w-full opacity-0 group-hover:opacity-100 bg-black/20 z-1 inset-0 transition-all duration-500'></div>
                                            </div>

                                            <Typography variant='h4' children={room?.room_type?.name} weight='semibold' />
                                            <Divider className='border' />

                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-base font-medium">{room?.converted_currency_symbol}{room?.converted_base_price_per_night?.toFixed(2)}</span>
                                                        <span className="text-sm textSecondaryColor">/ {t('night')}</span>
                                                    </div>
                                                    <p className="text-sm textSecondaryColor mt-0.5">+ {t('taxesAndFees')}</p>
                                                </div>
                                                <button className="btn_md primaryBtn w-10 h-10 hidden sm:flexCenter p-0">
                                                    <PiArrowUpRight className="text-lg sm:text-2xl rtl:rotate-270" />
                                                </button>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            :
                            <CarouselContent className="-ml-4 md:-ml-6">
                                {propertiesData?.map((property) => (
                                    <CarouselItem
                                        key={property?.id}
                                        className="pl-4 md:pl-6 basis-[65%] between-400-575:basis-[55%] sm:basis-[45%] lg:basis-1/3 xl:basis-1/5 cursor-pointer pb-3"
                                        onClick={() => handleRedirectDetailPage(property)}
                                    >
                                        <VerticalCard property={property as Property} className='[&>div]:w-full' />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                    }

                    {/* Pagination Dots */}
                    {scrollSnaps.length > 1 && (
                        <SwiperBullets count={scrollSnaps.length} current={current} api={api} />
                    )}
                </Carousel>
            </div>
        </section >
    )
}

export default SelectRooms
