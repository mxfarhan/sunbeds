import axios from "axios";
import { cache } from "react";
import { getServerApiBase } from "@/lib/apiBase";

export interface PolicySection {
  title: string;
  content: string;
}

export interface PolicyData {
  type: string;
  title: string;
  sections: PolicySection[];
  last_updated: string;
  og_image: string;
  meta_title: string;
  meta_description: string;
  meta_keyword: string;
  schema_markup: string;
}

export const getLegalPolicy = cache(async ({
  lang,
  type,
}: {
  lang: string;
  type: string;
}): Promise<PolicyData | null> => {
  try {
    const response = await axios.get(
      `${getServerApiBase()}/legal-policies`,
      { params: { lang, type } }
    );
    const data = response.data;
    if (!data || data.error) return null;
    const policy = data.data?.policies?.[type] as PolicyData | undefined;
    if (!policy) return null;

    // API may return Filament UUID-keyed section objects; normalize to an array.
    const rawSections = policy.sections as PolicySection[] | Record<string, PolicySection> | null | undefined;
    const sections = Array.isArray(rawSections)
      ? rawSections
      : rawSections && typeof rawSections === "object"
        ? Object.values(rawSections)
        : [];

    return { ...policy, sections };
  } catch (error) {
    console.error("Error fetching legal policy:", error);
    return null;
  }
})
