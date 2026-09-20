import SettingsHydrator from "@/components/SettingsHydrator";
import { fetchSettingsServer } from "@/lib/fetchSettingsServer";

export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSettings = await fetchSettingsServer();

  return (
    <SettingsHydrator initialSettings={initialSettings}>
      {children}
    </SettingsHydrator>
  );
}
