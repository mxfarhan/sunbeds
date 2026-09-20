import HelpSupport from "@/components/pagesComponent/helpSupport/HelpSupport"
import JsonLd from "@/components/Schema/JsonLd"
import { generateMetaInfo, getSchemaMarkup } from "@/hooks/useGenerateMetaInfo"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
    const { langCode } = await params;
    return generateMetaInfo({
        page: 'help-support',
        language_code: langCode,
    })
}

const Page = async ({ params }: { params: Promise<{ langCode: string }> }) => {
    const { langCode } = await params;

    const schemaMarkup = await getSchemaMarkup({
        page: "help-support",
        language_code: langCode
    });

    return (
        <>
            <HelpSupport />
            {schemaMarkup && <JsonLd data={schemaMarkup} />}
        </>
    )
}

export default Page
