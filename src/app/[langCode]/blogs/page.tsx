import Blogs from '@/components/pagesComponent/blogs/Blogs'
import JsonLd from '@/components/Schema/JsonLd'
import { generateMetaInfo, getSchemaMarkup } from '@/hooks/useGenerateMetaInfo'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
    const { langCode } = await params;

    return generateMetaInfo({
        page: 'blogs',
        language_code: langCode,
    })
}

const Page = async ({ params }: { params: Promise<{ langCode: string }> }) => {
    const { langCode } = await params;

    const schemaMarkup = await getSchemaMarkup({
        page: "blogs",
        language_code: langCode
    });

    return (
        <>
            <Blogs />
            {schemaMarkup && <JsonLd data={schemaMarkup} />}
        </>
    )
}

export default Page
