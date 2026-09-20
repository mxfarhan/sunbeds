import PropertySlugPage from "@/components/pagesComponent/property/PropertySlugPage"
import { getPropertyDetails } from "@/api/getPropertyDetails"
import { getResortDetails } from "@/api/getResortDetails"
import Layout from "@/components/layout/Layout"
import NoDataFound from "@/components/systemStates/NoDataFound"
import JsonLd from "@/components/Schema/JsonLd"
import axios from "axios"

async function getSettingsBasicDetails() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_END_POINT}/settings`
    );
    return response.data?.data?.basic_details ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string, langCode: string }> }) {
    const { slug, langCode } = await params
    const basicDetails = await getSettingsBasicDetails()
    const isSunbedMode = basicDetails?.booking_mode === 'sunbed' || basicDetails?.property_type === 'Resort'

    const resort = isSunbedMode ? await getResortDetails({ slug }) : null
    const property = !resort?.data ? await getPropertyDetails({ slug }) : null
    const data = resort?.data ?? property?.data

    return {
        title: data?.name || process.env.NEXT_PUBLIC_TITLE,
        description: (data as any)?.meta_description || (data as any)?.description || process.env.NEXT_PUBLIC_DESCRIPTION,
        keywords: (data as any)?.meta_keywords || process.env.NEXT_PUBLIC_KEYWORDS,
        openGraph: {
            title: data?.name || process.env.NEXT_PUBLIC_TITLE,
            description: (data as any)?.meta_description || (data as any)?.description || process.env.NEXT_PUBLIC_DESCRIPTION,
            images: (data as any)?.images?.[0] || process.env.NEXT_PUBLIC_IMAGE,
            type: "website",
            siteName: process.env.NEXT_PUBLIC_WEB_NAME,
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: data?.name || process.env.NEXT_PUBLIC_TITLE,
            description: (data as any)?.meta_description || (data as any)?.description || process.env.NEXT_PUBLIC_DESCRIPTION,
            images: (data as any)?.images?.[0] || process.env.NEXT_PUBLIC_IMAGE,
        },
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_WEB_URL}/${langCode}/properties/${slug}`,
        },
    }
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params
    const basicDetails = await getSettingsBasicDetails()
    const isSunbedMode = basicDetails?.booking_mode === 'sunbed' || basicDetails?.property_type === 'Resort'

    const [resortRes, propertyRes] = await Promise.all([
        isSunbedMode ? getResortDetails({ slug }) : Promise.resolve(null),
        getPropertyDetails({ slug }),
    ])

    const schemaMarkup = propertyRes?.data?.schema_markup
        ? (() => { try { return JSON.parse(propertyRes.data.schema_markup) } catch { return null } })()
        : null;

    const hasData = resortRes?.data || propertyRes?.data

    if (!hasData) {
        return (
            <Layout>
                <div className='h-screen flexCenter'>
                    <NoDataFound />
                </div>
            </Layout>
        )
    }

    return (
        <div>
            <PropertySlugPage
                propertyResData={propertyRes}
                resortResData={resortRes}
                preferResort={isSunbedMode}
            />
            {schemaMarkup && <JsonLd data={schemaMarkup} />}
        </div>
    )
}

export default Page
