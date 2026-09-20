import { getServerApiBase } from "./apiBase";
import type { SettingsApiResponse } from "@/hooks/queries/useSettings";

export async function fetchSettingsServer(): Promise<SettingsApiResponse | null> {
  try {
    const response = await fetch(`${getServerApiBase()}/settings`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as SettingsApiResponse;

    if (data?.error) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
