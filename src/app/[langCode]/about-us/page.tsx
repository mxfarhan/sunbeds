import AboutUsPage from '@/components/pagesComponent/AboutUsPage'
import JsonLd from '@/components/Schema/JsonLd'
import { generateMetaInfo, getSchemaMarkup } from '@/hooks/useGenerateMetaInfo'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
    const { langCode } = await params;
    
    return generateMetaInfo({
        page: 'about-us',
        language_code: langCode,
    })
}

const Page = async ({ params }: { params: Promise<{ langCode: string }> }) => {
    const { langCode } = await params;

    const schemaMarkup = await getSchemaMarkup({
        page: "about-us",
        language_code: langCode
    });

    return (
        <>
            <AboutUsPage />
            {schemaMarkup && <JsonLd data={schemaMarkup} />}
        </>
    )
}

export default Page
