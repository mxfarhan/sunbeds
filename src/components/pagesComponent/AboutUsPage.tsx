'use client'
import { PiArrowRight, PiCheckCircleFill } from "react-icons/pi"
import Layout from "../layout/Layout"
import Divider from "../storyBook/atoms/Divider"
import IconLabel from "../storyBook/atoms/IconLabel"
import { Typography } from "../storyBook/atoms/Typography"
import SectionInfo from "../storyBook/molecules/SectionInfo"
import HotelServices from "../homePage/singleHotelSections/HotelServices"
import Testimonials from "../homePage/singleHotelSections/Testimonials"
import { Button } from "../storyBook/atoms/Button"
import { useTranslation } from "@/hooks/useTranslation"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { MobileBreadcrum } from "../storyBook/molecules/mobileBreadcrum"
import { useAboutUsContent } from "@/hooks/queries/useAboutusContent"
import ImagePreview from "../storyBook/atoms/ImagePreview"
import RichTextContent from "../commonComponents/RichText"
import AboutUsPageSkeleton from "../skeletons/pages/AboutUsPageSkeleton"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { businessModeSelector } from "@/redux/reducers/settingsSlice"
import { GalleryGroup, usePropertyDetails } from "@/hooks/queries/usePropertyDetails"
import Link from "next/link"
import { currentLangCodeSelector } from "@/redux/reducers/languageSlice"

const AboutUsPage = () => {

    const { t } = useTranslation();
    const businessMode = useSelector(businessModeSelector);
    const langCode = useSelector(currentLangCodeSelector);
    const isSingleHotel = businessMode?.business_mode === 'single' && businessMode?.no_of_properties === 1;

    const { data: aboutUsContent, isLoading, error } = useAboutUsContent();

    useEffect(() => {
        if (error) {
            console.log("error in aboutUs page api =>", error)
        }
    }, [error])


    const whoWeAreContent = aboutUsContent?.data?.who_we_are;
    const keyHighlights = aboutUsContent?.data?.key_highlights;
    const promises = aboutUsContent?.data?.our_promise;



    const { data, isLoading: propertiesLoading, error: propertiesError, isError: propertiesIsError } = usePropertyDetails({
        slug: businessMode?.slug,
    }, isSingleHotel);

    const propertyData = data?.data

    const galleryImgs = propertyData?.images?.primary ?? []

    useEffect(() => {
        if (propertiesIsError) {
            console.log("propertiesError =>", propertiesError)
        }
    }, [propertiesIsError]);

    return (
        <Layout>
            {
                isLoading ? <AboutUsPageSkeleton />
                    :
                    <>
                        <MobileBreadcrum title={t('aboutUs')} />
                        {/* who we are section */}
                        {
                            whoWeAreContent &&
                            <section className="bg-white commonPY">
                                <div className="container">
                                    <section className="flex flex-col gap-4 md:gap-6">
                                        <SectionInfo badge={whoWeAreContent?.badge_text || ''} title={whoWeAreContent?.title || ''} desc={whoWeAreContent?.short_description || ''} showInRichText={true} />

                                        <ImagePreview src={whoWeAreContent?.image || ''} className="h-[132px] sm:h-[250px] md:h-[350px] lg:h-[600px] w-full" rounded="2xl" alt={whoWeAreContent?.title || ''} />

                                        <RichTextContent content={whoWeAreContent?.content || ''} />
                                        {
                                            keyHighlights && keyHighlights?.length > 0 &&
                                            <Divider />
                                        }
                                        {
                                            keyHighlights && keyHighlights?.length > 0 &&
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {keyHighlights?.map((stat, i) => (
                                                    <div key={i} className="bg-[#f0f5fa] rounded-2xl p-3 sm:p-6 flex flex-col justify-center gap-3 sm:gap-4">
                                                        <Typography variant="h3" weight="semibold" className="primaryColor" children={stat.title} />
                                                        <Typography variant="desc1" weight="semibold" className="lg:text-lg textPrimaryColor!" children={stat.description} />
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                    </section>
                                    <section>

                                    </section>
                                </div>
                            </section>
                        }

                        {/* our promise section */}
                        {
                            promises &&
                            <section className="commonPY container">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6">
                                    <div className="flex flex-col gap-6 md:gap-10">
                                        <SectionInfo badge={promises?.badge_text || ''} title={promises?.title || ''} desc={promises?.content || ''} showInRichText={true} />

                                        <div className="space-y-4">
                                            {
                                                promises?.features?.map((item, index) => {
                                                    return (
                                                        <div key={index}>
                                                            <IconLabel icon={<PiCheckCircleFill className="primaryColor text-xl" />} label={item} className="" />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                    </div>

                                    <div className="flexCenter">
                                        <ImagePreview src={promises?.image} alt={promises?.title || ''} className="h-[279px] sm:h-[350px] md:h-[600px] w-full" rounded="2xl" />
                                    </div>

                                </div>

                            </section>
                        }
                        <HotelServices bgWhite={true} />
                        <Testimonials />

                        {galleryImgs?.length > 0 &&
                            <section className="bg-white commonPY">
                                <div className="container space-y-6">

                                    <div className="grid grid-cols-12">
                                        <div className="col-span-12 sm:col-span-8">
                                            <SectionInfo badge={'Our Gallery'} title={'A closer look at our spaces and experiences'} desc="Explore images of our rooms, amenities, event spaces, and the welcoming atmosphere we offer." />
                                        </div>
                                        <div className="col-span-12 sm:col-span-4 flex justify-end items-end">
                                            <Link href={`/${langCode}/gallery`} passHref>
                                                <Button variant="primary" children={t('viewAllPhotos')} rightIcon={<PiArrowRight className="text-2xl rtl:rotate-180" />} />
                                            </Link>
                                        </div>

                                    </div>
                                    <div className="mt-8">
                                        <Carousel
                                            opts={{
                                                align: "start",
                                                loop: true,
                                            }}
                                            className="w-full"
                                        >
                                            <CarouselContent>
                                                {galleryImgs.map((item, index) => (
                                                    <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3 xl:basis-[30%]">
                                                        <div className="overflow-hidden rounded-2xl h-62.5 md:h-75 lg:h-87.5 w-full">
                                                            <ImagePreview src={item.url} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                        </Carousel>
                                    </div>
                                </div>
                            </section>}
                    </>
            }
        </Layout >
    )
}

export default AboutUsPage