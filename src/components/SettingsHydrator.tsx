"use client";

import { createContext, useContext, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { setSettings } from "@/redux/reducers/settingsSlice";
import type { SettingsApiResponse } from "@/hooks/queries/useSettings";

export const SettingsContext = createContext<SettingsApiResponse | null>(null);

export function usePrefetchedSettings() {
  return useContext(SettingsContext);
}

export default function SettingsHydrator({
  initialSettings,
  children,
}: {
  initialSettings: SettingsApiResponse | null;
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    if (initialSettings?.data) {
      dispatch(setSettings(initialSettings.data));
    }
  }, [dispatch, initialSettings]);

  return (
    <SettingsContext.Provider value={initialSettings}>
      {children}
    </SettingsContext.Provider>
  );
}
