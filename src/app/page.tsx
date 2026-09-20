import { getDefaultLanguage } from "@/api/getDefaultLanguage";
import { permanentRedirect } from "next/navigation";

export default async function Page() {
  const defaultLanguage = await getDefaultLanguage();
  const defaultLanguageCode = defaultLanguage?.code || "en";
  permanentRedirect(`/${defaultLanguageCode}`);
}