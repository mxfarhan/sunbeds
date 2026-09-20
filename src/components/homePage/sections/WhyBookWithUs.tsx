'use client'
import Icon1 from '@/assets/images/verifyStays.svg'
import Icon2 from '@/assets/images/securePayment.svg'
import Icon3 from '@/assets/images/confimation.svg'
import Icon4 from '@/assets/images/support.svg'
import { PiArrowRight } from 'react-icons/pi'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import SectionInfo from '@/components/storyBook/molecules/SectionInfo'
import { Typography } from '@/components/storyBook/atoms/Typography'
import ImagePreview from '@/components/storyBook/atoms/ImagePreview'
import Divider from '@/components/storyBook/atoms/Divider'


const WhyBookWithUs = () => {

    const { t } = useTranslation()

    const features = [
        {
            icon: Icon1,
            title: 'Verified stays',
            description: 'Every property is reviewed and verified for quality and comfort.',
        },
        {
            icon: Icon2,
            title: 'Secure payments',
            description: 'Your payments are protected with trusted and secure gateways.',
        },
        {
            icon: Icon3,
            title: 'Instant confirmation',
            description: 'Get immediate booking confirmation with no waiting.',
        },
        {
            icon: Icon4,
            title: 'Dedicated support',
            description: "We're here to help before, during, and after your stay.",
        },
    ]

    return (
        <section className="commonMT commonPY pb-12">
            <div className="container">
                <div className='grid grid-cols-1 gap-6'>
                    {/* Header */}
                    <SectionInfo title={t('whyBookUs')} desc={t('whyBookUsDesc')} />

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 min-1200:grid-cols-4 gap-6 sm:commonGap">
                        {features.map((feature, index) => {
                            return (
                                <div
                                    key={index}
                                    className="primaryLightBg rounded-2xl max-575:p-3 between-1200-1399:p-4 p-6 flex flex-col gap-4 md:gap-6 lg:commonGap border primaryLightBorderColor"
                                >
                                    {/* Icon */}
                                    <div className="w-12 h-12 md:w-24 md:h-24 bg-white rounded-full flexCenter">
                                        <ImagePreview src={feature.icon} alt={feature.title} className='w-6 h-6 sm:w-12 sm:h-12' />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col gap-4 min-1200:gap-6 mt-4 sm:mt-8 min-1200:mt-36">
                                        <Typography variant='h3' children={feature.title} weight='semibold' />
                                        <Divider className='bg-[#D1E3FA]!' />
                                        <Typography variant='desc2' children={feature.description} weight='medium' />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* CTA Banner */}
                    <div className="bg-white rounded-2xl p-4 between-992-1199:p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-4 border primaryLightBorderColor">
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* User Avatars */}
                            <div className="flex -space-x-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 border-2 border-white flexCenter text-white font-semibold text-sm">
                                    A
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 border-2 border-white flexCenter text-white font-semibold text-sm">
                                    B
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 border-2 border-white flexCenter text-white font-semibold text-sm">
                                    C
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--neutral-900)] border-2 border-white flexCenter text-white font-semibold text-xs md:text-sm">
                                    812+
                                </div>
                            </div>

                            {/* Text */}
                            <div className="flex flex-col">
                                <Typography variant='h4' children={t('turnPropertyInBookingMagnet')} weight='semibold' />
                                <Typography variant='desc2' children={t('connetWithTravelers')} />
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Link href={'/'} className="primaryBtn btn_md between-992-1199:text-base md:btn_lg flexCenter gap-2 w-full text-center lg:w-fit ">
                            {t('listYourProperty')}
                            <PiArrowRight className="text-2xl rtl:rotate-180" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default WhyBookWithUs
