'use client'
import { useEffect, useState } from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel'
import SectionInfo from '@/components/storyBook/molecules/SectionInfo'
import ImagePreview from '@/components/storyBook/atoms/ImagePreview'
import { Typography } from '@/components/storyBook/atoms/Typography'
import Divider from '@/components/storyBook/atoms/Divider'
import Ratings from '@/components/storyBook/atoms/Ratings'
import { useSelector } from 'react-redux'
import { testimonialsSelector } from '@/redux/reducers/helpersReducer'
import { getDirection } from '@/utils/helpers'
import { useTranslation } from '@/hooks/useTranslation'

const Testimonials = () => {

    const { t } = useTranslation();

    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    const testimonials = useSelector(testimonialsSelector);

    useEffect(() => {
        if (!api) return
        setCurrent(api.selectedScrollSnap())
        api.on('select', () => setCurrent(api.selectedScrollSnap()))
    }, [api])

    return (
        testimonials?.length > 0 &&
        <section className='container commonPY'>
            <div className='space-y-6 sm:space-y-8 md:space-y-12'>

                {
                    testimonials?.length > 0 &&
                    <SectionInfo
                        badge={t('testimonialsBadge')}
                        title={t('testimonialsTitle')}
                        desc={t('testimonialsDesc')}
                        isCenter={true}
                    />
                }
                {/* Carousel */}
                <Carousel
                    opts={{ align: 'start', loop: false }}
                    className='w-full'
                    setApi={setApi}
                    dir={getDirection()}
                >
                    <CarouselContent className='-ml-4 md:-ml-6'>
                        {testimonials?.map((item) => (
                            <CarouselItem
                                key={item.id}
                                className='pl-4 md:pl-6 basis-[85%] sm:basis-[60%] lg:basis-1/3'
                            >
                                {/* Card */}
                                <div className='flex flex-col gap-4 border rounded-2xl p-4 sm:p-5 bodyBg h-full'>

                                    {/* Top row: avatar + name/category + rating */}
                                    <div className='flex items-center gap-3'>

                                        {/* Avatar */}
                                        <div className='w-11 h-11 shrink-0'>
                                            <ImagePreview src={item?.user?.avatar} alt={item?.user?.name} rounded='full'/>
                                        </div>

                                        {/* Name & category */}
                                        <div className='flex-1 min-w-0 space-y-1'>
                                            <Typography variant='h6' weight='medium' className='leading-tight truncate'>
                                                {item?.user?.name}
                                            </Typography>
                                            <Typography variant='desc2'>
                                                {item?.room_type?.name}
                                            </Typography>
                                        </div>

                                        {/* Star rating */}
                                        <Ratings value={item?.rating} />
                                    </div>

                                    <Divider />

                                    {/* Review text */}
                                    <Typography variant='desc1' className='' weight='regular'>
                                        {item?.review}
                                    </Typography>

                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Centered prev / next arrows */}
                    {
                        testimonials?.length > 3 && (
                            <div className='flex items-center justify-center gap-4 mt-8'>
                                <CarouselPrevious className='relative translate-y-0 left-0 right-0 h-10 w-10 border-black rtl:rotate-180'  />
                                <CarouselNext className='relative translate-y-0 left-0 right-0 h-10 w-10 border-black rtl:rotate-180' />
                            </div>
                        )
                    }

                </Carousel>

            </div>
        </section>
    )
}

export default Testimonials
