'use client'
import slider from '@/assets/images/logo.png'
import { PropertyDataType } from '@/types/GlobalTypes'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { PiCaretRight } from 'react-icons/pi'
import PropertiesSliderSection from './PropertiesSliderSection'
// import VerticalCard from '@/components/storyBook/molecules/PropertyCard/verticalCard'
import SectionInfo from '@/components/storyBook/molecules/SectionInfo'
import { Button } from '@/components/storyBook/atoms/Button'


const PropertiesSection = ({ title }: { title: string }) => {

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
        <>
            <section className="hidden sm:block container commonMT">
                <div className="flex items-center justify-between mb-7">
                    <SectionInfo title={title} />
                    <div className='flexCenter'>
                        <Link href={'/'}>
                            <Button variant='outline' size='md' children={t('exploreAllStays')} rightIcon={<PiCaretRight className='text-2xl' />}/>
                        </Link>
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 between-1200-1399:grid-cols-4 xl:grid-cols-5 commonGap">
                    {properties.map((property) => (
                        <div
                            key={property.id}
                        >
                            {/* <VerticalCard property={property} /> */}
                        </div>
                    ))}
                </div>
            </section>
            <section className="sm:hidden">
                <PropertiesSliderSection title={title} isPropertySection={true} />
            </section>
        </>
    )
}

export default PropertiesSection
