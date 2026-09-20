import { Suspense } from "react"
import PropertyPage from "@/components/pagesComponent/property/PropertyPage"
import { generateMetaInfo, getSchemaMarkup } from "@/hooks/useGenerateMetaInfo"
import { Metadata } from "next"
import JsonLd from "@/components/Schema/JsonLd"

export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
    const { langCode } = await params;
    return generateMetaInfo({
        page: 'rooms',
        language_code: langCode,
    })
}

const Page = async ({ params }: { params: Promise<{ langCode: string }> }) => {
    const { langCode } = await params;

    const schemaMarkup = await getSchemaMarkup({
        page: "rooms",
        language_code: langCode
    });

    return (
        <>
            <Suspense>
                <PropertyPage />
            </Suspense>
            {schemaMarkup && <JsonLd data={schemaMarkup} />}
        </>
    )
}

export default Page
