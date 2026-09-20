'use client'
import ImagePreview from '@/components/storyBook/atoms/ImagePreview';
import { Typography } from '@/components/storyBook/atoms/Typography';
import SectionInfo from '@/components/storyBook/molecules/SectionInfo'
import { useTranslation } from '@/hooks/useTranslation'
import { businessModeSelector } from '@/redux/reducers/settingsSlice';
import { useSelector } from 'react-redux';
import home_about from '@/assets/images/home_about.png'

const HowItWorks = () => {

    const { t } = useTranslation();
    const bussinessMode = useSelector(businessModeSelector);
    const isSingleHotel = bussinessMode?.business_mode === 'single' && bussinessMode?.no_of_properties === 1;

    const singleHotelSteps = [
        { num: '01', title: t('step1Title'), desc: t('step1Desc') },
        { num: '02', title: t('step2Title'), desc: t('step2Desc') },
        { num: '03', title: t('step3Title'), desc: t('step3Desc') },
    ];

    const multiHotelSteps = [
        { num: '01', title: t('step1MultiTitle'), desc: t('step1MultiDesc') },
        { num: '02', title: t('step1Title'), desc: t('step1Desc') },
        { num: '03', title: t('step2Title'), desc: t('step2Desc') },
        { num: '04', title: t('step3Title'), desc: t('step3Desc') },
    ];

    const steps = isSingleHotel ? singleHotelSteps : multiHotelSteps;

    return (
        <section className="bg-[#020B17] commonPY">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
                    <div className='flex flex-col justify-center commonGap'>
                        <SectionInfo badge={t('howItWorks')} title={t('bookYourStayTitle')} desc={t('bookYourStayDesc')} isTextWhite={true} />
                        {/* Steps list */}
                        <div className="flex flex-col w-full">
                            {steps.map((step, idx, arr) => (
                                <div key={step.num} className="flex items-start gap-5">
                                    {/* Left: circle + dashed line */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div
                                            className="w-14 h-14 rounded-full border-2 border-white bg-white text-black flex items-center justify-center"
                                        >
                                            <Typography variant='h3' weight='semibold' children={step.num}/>
                                        </div>
                                        {/* Dashed connector — hide after last item */}
                                        {idx < arr.length - 1 && (
                                            <div
                                                className="w-px flex-1 my-1"
                                                style={{
                                                    minHeight: '40px',
                                                    borderLeft: '2px dashed rgba(255,255,255,0.25)',
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Right: text content */}
                                    <div className={`${idx === arr.length - 1 ? 'pb-0' : ''}`}>
                                        <Typography variant='h5' children={step.title} weight='semibold' className='text-white'/>
                                        <Typography variant='desc2' children={step.desc} weight='regular' className='text-[#BFBFBF]!' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='flexCenter'>
                        <div>
                            <ImagePreview src={home_about.src} alt='howItWorks' className='rounded-2xl'/>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default HowItWorks
