import HomePage from "@/components/homePage/HomePage";
import JsonLd from "@/components/Schema/JsonLd";
import { generateMetaInfo, getSchemaMarkup } from "@/hooks/useGenerateMetaInfo";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ langCode: string }> }): Promise<Metadata> {
  const { langCode } = await params;
  return generateMetaInfo({
    page: 'home',
    language_code: langCode,
  })
}

// Fetch schema markup for SEO
export default async function Home({ params }: { params: Promise<{ langCode: string }> }) {
  const { langCode } = await params;

  const schemaMarkup = await getSchemaMarkup({
    page: "home",
    language_code: langCode,
  });

  return (
    <>
      <main>
        <HomePage />
      </main>
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </>

  );
}
