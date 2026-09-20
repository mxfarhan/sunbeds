import { Suspense } from "react";
import HomePage from "@/components/homePage/HomePage";
import JsonLd from "@/components/Schema/JsonLd";
import Layout from "@/components/layout/Layout";
import HomePageSkeleton from "@/components/skeletons/pages/HomePageSkeleton";
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
        <Suspense fallback={<Layout><HomePageSkeleton /></Layout>}>
          <HomePage />
        </Suspense>
      </main>
      {schemaMarkup && <JsonLd data={schemaMarkup} />}
    </>

  );
}
