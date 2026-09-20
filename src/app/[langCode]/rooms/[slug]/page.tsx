import PropertyDetailsPage from "@/components/pagesComponent/property/PropertyDetailsPage"
import { getRoomDetails } from "@/api/getRoomDetails"
import Layout from "@/components/layout/Layout"
import NoDataFound from "@/components/systemStates/NoDataFound"
import JsonLd from "@/components/Schema/JsonLd"

export async function generateMetadata({ params }: { params: Promise<{ slug: string, langCode: string }> }) {
    const { slug, langCode } = await params
    const room = await getRoomDetails({ slug })
    const data = room?.data

    const seoData = data?.items?.[0]?.room_type

    return {
        title: seoData?.meta_title || process.env.NEXT_PUBLIC_TITLE,
        description: seoData?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
        keywords: seoData?.meta_keywords || process.env.NEXT_PUBLIC_KEYWORDS,
        openGraph: {
            title: seoData?.meta_title || process.env.NEXT_PUBLIC_TITLE,
            description: seoData?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
            images: process.env.NEXT_PUBLIC_IMAGE,
            type: "website",
            siteName: process.env.NEXT_PUBLIC_WEB_NAME,
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: seoData?.meta_title || process.env.NEXT_PUBLIC_TITLE,
            description: seoData?.meta_description || process.env.NEXT_PUBLIC_DESCRIPTION,
            images: process.env.NEXT_PUBLIC_IMAGE,
        },
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_WEB_URL}/${langCode}/rooms/${slug}`,
        },
    }
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params
    const resData = await getRoomDetails({ slug });

    const schemaMarkup = resData?.data?.items?.[0]?.room_type?.schema_markup
        ? (() => { try { return JSON.parse(resData.data.items?.[0]?.room_type?.schema_markup) } catch { return null } })()
        : null;

    if (!resData) {
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
            <PropertyDetailsPage />
            {schemaMarkup && <JsonLd data={schemaMarkup} />}
        </div>
    )
}

export default Page
