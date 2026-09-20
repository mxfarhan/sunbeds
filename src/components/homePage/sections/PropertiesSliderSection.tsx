'use client'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import slider from '@/assets/images/logo.png'
import { PropertyDataType } from '@/types/GlobalTypes'
import { useTranslation } from "@/hooks/useTranslation"
import { PiCaretRight } from "react-icons/pi"
import Link from "next/link"
import HorizontalCard from "@/components/storyBook/molecules/PropertyCard/horizontalCard"
// import VerticalCard from "@/components/storyBook/molecules/PropertyCard/verticalCard"
import SectionInfo from "@/components/storyBook/molecules/SectionInfo"
import { getDirection } from "@/utils/helpers"


const PropertiesSliderSection = ({ title, isPropertySection }: { title: string, isPropertySection?: boolean }) => {

    const { t } = useTranslation()

    // Sample property data - replace with actual data
    const properties: PropertyDataType[] = [
        {
            id: 1,
            image: slider,
            rating: 4.7,
            reviews: 720,
            name: "Hotel Silver Leaf Residency",
            location: "Ahmedabad - Gujarat",
            price: 149.00,
            wishlist: false
        },
        {
            id: 2,
            image: slider,
            rating: 4.7,
            reviews: 720,
            name: "Hotel Silver Leaf Residency",
            location: "Ahmedabad - Gujarat",
            price: 149.00,
            wishlist: false,
            taxFees: 149,
            featured: true
        },
        {
            id: 3,
            image: slider,
            rating: 4.7,
            reviews: 720,
            name: "Hotel Silver Leaf Residency",
            location: "Ahmedabad - Gujarat",
            price: 149.00,
            wishlist: true
        },
        {
            id: 4,
            image: slider,
            rating: 0,
            reviews: 0,
            name: "Hotel Silver Leaf Residency",
            location: "Ahmedabad - Gujarat",
            price: 149.00,
            wishlist: false,
            taxFees: 149,
            featured: true
        },
        {
            id: 5,
            image: slider,
            rating: 4.7,
            reviews: 720,
            name: "Hotel Silver Leaf Residency",
            location: "Ahmedabad - Gujarat",
            price: 149.00,
            wishlist: false,
            taxFees: 149,
        }
    ]

    return (
        <section className={`container ${isPropertySection ? 'commonMT' : ''}`}>

            {/* Desktop Carousel — HorizontalCard (md and above) */}
            <Carousel
                opts={{ align: "start", loop: false }}
                className="w-full hidden md:block"
                dir={getDirection()}
            >
                <div className="flex items-center justify-between mb-7">
                    <SectionInfo title={title}/>
                    {isPropertySection ? (
                        <Link href={'/'} className='primaryColor flexCenter gap-2'>
                            {t('exploreAllStays')}
                            <PiCaretRight className='text-2xl' />
                        </Link>
                    ) : (
                        <div className="flexCenter gap-4">
                            <CarouselPrevious className="left-0 relative sm:h-10 sm:w-10 translate-y-0 rtl:rotate-180" />
                            <CarouselNext className="right-0 relative sm:h-10 sm:w-10 translate-y-0 rtl:rotate-180" />
                        </div>
                    )}
                </div>
                <CarouselContent className="-ml-7">
                    {properties.map((property) => (
                        <CarouselItem
                            key={property.id}
                            className="pl-[30px] basis-full sm:basis-[60%] md:basis-[60%] lg:basis-[50%] between-1200-1399:basis-2/5 2xl:basis-1/3"
                        >
                            <HorizontalCard property={property} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Mobile Carousel — VerticalCard (below md) */}
            <Carousel
                opts={{ align: "start", loop: false }}
                className="w-full md:hidden"
            >
                <div className="flex items-center justify-between mb-7 flex-wrap gap-y-3">
                    <h2 className="text-lg sm:text-2xl font-medium">
                        {title}
                    </h2>
                    {isPropertySection ? (
                        <Link href={'/'} className='primaryColor flexCenter gap-2'>
                            {t('exploreAllStays')}
                            <PiCaretRight className='text-2xl' />
                        </Link>
                    ) : (
                        <div className="flexCenter gap-4">
                            <CarouselPrevious className="left-0 relative h-8 w-8 translate-y-0" />
                            <CarouselNext className="right-0 relative h-8 w-8 translate-y-0" />
                        </div>
                    )}
                </div>
                <CarouselContent className="-ml-2">
                    {properties.map((property) => (
                        <CarouselItem
                            key={property.id}
                            className="pl-4 basis-[70%]"
                        >
                            {/* <VerticalCard property={property} /> */}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

        </section>
    )
}

export default PropertiesSliderSection
